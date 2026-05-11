const User = require("../models/User");

class UserRepository {
  async create(data) {
    return User.create(data);
  }

  async findById(id, selectPassword = false) {
    const query = User.findById(id);
    if (selectPassword) query.select("+passwordHash");
    return query;
  }

  async findByEmail(email, selectPassword = false) {
    const query = User.findOne({ email });
    if (selectPassword) query.select("+passwordHash");
    return query;
  }

  async findAll(filter = {}, { skip = 0, limit = 20 } = {}) {
    return User.find(filter)
      .populate("mentorId", "name level department")
      .skip(skip)
      .limit(limit)
      .sort("-createdAt");
  }

  async countAll(filter = {}) {
    return User.countDocuments(filter);
  }

  async updateById(id, data) {
    return User.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async deleteById(id) {
    return User.findByIdAndDelete(id);
  }

  async findMentees(mentorId) {
    return User.find({ mentorId, isActive: true });
  }

  async findAllActiveEmployees() {
    return User.find({ role: "employee", isActive: true }).select("_id");
  }

  async findAllActiveUsers() {
    return User.find({ isActive: true }).select("_id");
  }

  async setMentor(employeeId, mentorId) {
    return User.findByIdAndUpdate(
      employeeId,
      { mentorId },
      { new: true, runValidators: true },
    );
  }

  async removeMentor(employeeId) {
    return User.findByIdAndUpdate(
      employeeId,
      { mentorId: null },
      { new: true },
    );
  }
}

module.exports = new UserRepository();
