const userRepository = require('../repositories/userRepository');
const mboFormRepository = require('../repositories/mboFormRepository');
const AppError = require('../utils/AppError');

class UserService {
  /**
   * Create a new user (Admin/HR only).
   */
  async createUser(data) {
    // Check for existing email
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw new AppError('A user with this email already exists.', 400);
    }

    // Map password → passwordHash for the model
    const userData = {
      name: data.name,
      email: data.email,
      passwordHash: data.password,
      role: data.role || 'employee',
      level: data.level || null,
      department: data.department || null,
    };

    return userRepository.create(userData);
  }

  /**
   * List all users with pagination and filtering.
   */
  async listUsers(query) {
    const filter = {};
    if (query.name) filter.name = new RegExp(query.name, 'i');
    if (query.level) filter.level = query.level;
    if (query.department) filter.department = new RegExp(query.department, 'i');
    if (query.role) filter.role = query.role;

    const page = Math.max(parseInt(query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      userRepository.findAll(filter, { skip, limit }),
      userRepository.countAll(filter),
    ]);

    return { users, total, page, limit, pages: Math.ceil(total / limit) };
  }

  /**
   * Get user profile with mentor info, mentees, and MBO form history (status only).
   */
  async getUserProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('User not found.', 404);

    const [mentees, mboForms] = await Promise.all([
      userRepository.findMentees(userId),
      mboFormRepository.findAllForAdmin({ employeeId: userId }), // status only
    ]);

    // Get mentor info
    let mentor = null;
    if (user.mentorId) {
      mentor = await userRepository.findById(user.mentorId);
    }

    return {
      user,
      mentor: mentor ? { _id: mentor._id, name: mentor.name, email: mentor.email } : null,
      mentees: mentees.map((m) => ({ _id: m._id, name: m.name, email: m.email, level: m.level })),
      mboHistory: mboForms,
    };
  }

  /**
   * Update user details (name, level, department).
   */
  async updateUser(userId, data) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('User not found.', 404);

    return userRepository.updateById(userId, data);
  }

  /**
   * Deactivate a user account (Admin only).
   */
  async deactivateUser(userId, requestingUserId) {
    if (userId === requestingUserId.toString()) {
      throw new AppError('You cannot deactivate your own account.', 400);
    }

    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('User not found.', 404);
    if (!user.isActive) throw new AppError('User is already deactivated.', 400);

    return userRepository.updateById(userId, { isActive: false });
  }
}

module.exports = new UserService();
