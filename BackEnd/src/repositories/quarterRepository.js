const Quarter = require('../models/Quarter');

class QuarterRepository {
  async create(data) {
    return Quarter.create(data);
  }

  async findById(id) {
    return Quarter.findById(id);
  }

  async findOpenQuarter() {
    return Quarter.findOne({ status: 'open' });
  }

  async findAll() {
    return Quarter.find().sort('-openedAt');
  }

  async updateById(id, data) {
    return Quarter.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }
}

module.exports = new QuarterRepository();
