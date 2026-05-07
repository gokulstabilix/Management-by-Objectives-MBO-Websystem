const userRepository = require('../repositories/userRepository');
const AppError = require('../utils/AppError');
const { LEVEL_HIERARCHY, VALID_MENTOR_PAIRINGS } = require('../config/constants');

class MentorMapService {
  /**
   * Validate that mentor is at a higher level than mentee
   * and that the pairing is in the allowed list.
   */
  _validateLevels(mentor, mentee) {
    if (LEVEL_HIERARCHY[mentor.level] <= LEVEL_HIERARCHY[mentee.level]) {
      throw new AppError(
        `Mentor (${mentor.level}) must be at a higher level than mentee (${mentee.level}).`,
        400
      );
    }

    const allowedMentees = VALID_MENTOR_PAIRINGS[mentor.level];
    if (!allowedMentees || !allowedMentees.includes(mentee.level)) {
      throw new AppError(
        `A ${mentor.level}-level user cannot mentor a ${mentee.level}-level user.`,
        400
      );
    }
  }

  /**
   * Assign a mentor to an employee (HR only).
   */
  async assignMentor(employeeId, mentorId) {
    if (employeeId === mentorId) {
      throw new AppError('A user cannot be their own mentor.', 400);
    }

    const [employee, mentor] = await Promise.all([
      userRepository.findById(employeeId),
      userRepository.findById(mentorId),
    ]);

    if (!employee) throw new AppError('Employee not found.', 404);
    if (!mentor) throw new AppError('Mentor not found.', 404);
    if (employee.role !== 'employee') throw new AppError('Mentor mapping is only for employees.', 400);
    if (mentor.role !== 'employee') throw new AppError('Mentor must also be an employee.', 400);
    if (!employee.isActive) throw new AppError('Cannot assign mentor to an inactive employee.', 400);
    if (!mentor.isActive) throw new AppError('Cannot assign an inactive user as mentor.', 400);

    if (employee.mentorId) {
      throw new AppError('Employee already has a mentor. Use PATCH to update.', 400);
    }

    this._validateLevels(mentor, employee);

    return userRepository.setMentor(employeeId, mentorId);
  }

  /**
   * Update mentor assignment (HR only).
   */
  async updateMentor(employeeId, newMentorId) {
    if (employeeId === newMentorId) {
      throw new AppError('A user cannot be their own mentor.', 400);
    }

    const [employee, newMentor] = await Promise.all([
      userRepository.findById(employeeId),
      userRepository.findById(newMentorId),
    ]);

    if (!employee) throw new AppError('Employee not found.', 404);
    if (!newMentor) throw new AppError('New mentor not found.', 404);
    if (newMentor.role !== 'employee') throw new AppError('Mentor must be an employee.', 400);
    if (!newMentor.isActive) throw new AppError('Cannot assign an inactive user as mentor.', 400);

    this._validateLevels(newMentor, employee);

    return userRepository.setMentor(employeeId, newMentorId);
  }

  /**
   * Remove mentor assignment (preserves MBO history).
   */
  async removeMentor(employeeId) {
    const employee = await userRepository.findById(employeeId);
    if (!employee) throw new AppError('Employee not found.', 404);

    if (!employee.mentorId) {
      throw new AppError('Employee does not have a mentor assigned.', 400);
    }

    return userRepository.removeMentor(employeeId);
  }

  /**
   * List all current mentor–mentee mappings.
   */
  async listMappings() {
    const employees = await userRepository.findAll({ mentorId: { $ne: null } }, { skip: 0, limit: 1000 });

    // Populate mentor info manually for clarity
    const User = require('../models/User');
    const mapped = await User.populate(employees, {
      path: 'mentorId',
      select: 'name email level department',
    });

    return mapped.map((e) => ({
      employee: { _id: e._id, name: e.name, email: e.email, level: e.level },
      mentor: e.mentorId
        ? { _id: e.mentorId._id, name: e.mentorId.name, email: e.mentorId.email, level: e.mentorId.level }
        : null,
    }));
  }
}

module.exports = new MentorMapService();
