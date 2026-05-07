const quarterRepository = require('../repositories/quarterRepository');
const mboFormRepository = require('../repositories/mboFormRepository');
const notificationService = require('./notificationService');
const AppError = require('../utils/AppError');

class QuarterService {
  async createQuarter(label, openedByUserId) {
    const openQuarter = await quarterRepository.findOpenQuarter();
    if (openQuarter) {
      throw new AppError(
        `Quarter "${openQuarter.label}" is already open. Close it before opening a new one.`,
        400
      );
    }

    const quarter = await quarterRepository.create({
      label,
      status: 'open',
      openedBy: openedByUserId,
      openedAt: new Date(),
    });

    await notificationService.notifyQuarterOpened(quarter._id, quarter.label);
    return quarter;
  }

  async closeQuarter(quarterId, closedByUserId) {
    const quarter = await quarterRepository.findById(quarterId);
    if (!quarter) throw new AppError('Quarter not found.', 404);
    if (quarter.status === 'closed') throw new AppError('This quarter is already closed.', 400);

    await mboFormRepository.freezeByQuarter(quarter._id);

    const updatedQuarter = await quarterRepository.updateById(quarterId, {
      status: 'closed',
      closedBy: closedByUserId,
      closedAt: new Date(),
    });

    await notificationService.notifyQuarterClosed(quarter._id, quarter.label);
    return updatedQuarter;
  }

  async listQuarters() {
    const quarters = await quarterRepository.findAll();
    const result = await Promise.all(
      quarters.map(async (q) => {
        const counts = await mboFormRepository.countByQuarter(q._id);
        const statusCounts = {};
        counts.forEach((c) => { statusCounts[c._id] = c.count; });
        return { ...q.toJSON(), formStatusCounts: statusCounts };
      })
    );
    return result;
  }

  async getQuarter(quarterId) {
    const quarter = await quarterRepository.findById(quarterId);
    if (!quarter) throw new AppError('Quarter not found.', 404);
    const counts = await mboFormRepository.countByQuarter(quarter._id);
    const statusCounts = {};
    counts.forEach((c) => { statusCounts[c._id] = c.count; });
    return { ...quarter.toJSON(), formStatusCounts: statusCounts };
  }
}

module.exports = new QuarterService();
