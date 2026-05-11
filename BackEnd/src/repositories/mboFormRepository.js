const MboForm = require('../models/MboForm');

/**
 * Fields EXCLUDED from HR/Admin queries — protects audit data.
 */
const HR_ADMIN_PROJECTION = '-mentorReview -objectives';

class MboFormRepository {
  async create(data) {
    return MboForm.create(data);
  }

  async findById(id) {
    return MboForm.findById(id);
  }

  /**
   * Full form with populated references — used for employee & mentor views.
   */
  async findByIdFull(id) {
    return MboForm.findById(id)
      .populate('employeeId', 'name email level department')
      .populate('quarterId', 'label status')
      .populate('mentorReview.mentorId', 'name email');
  }

  async findByEmployeeAndQuarter(employeeId, quarterId) {
    return MboForm.findOne({ employeeId, quarterId });
  }

  async findByEmployee(employeeId) {
    return MboForm.find({ employeeId })
      .populate('quarterId', 'label status')
      .sort('-updatedAt');
  }

  /**
   * Forms for a mentor's mentees — full content for mentor view.
   */
  async findByMentees(menteeIds, filters = {}) {
    return MboForm.find({ employeeId: { $in: menteeIds }, ...filters })
      .populate('employeeId', 'name email level department')
      .populate('quarterId', 'label status')
      .sort('-updatedAt');
  }

  /**
   * HR/Admin listing — status only, NO content or mentorReview.
   */
  async findAllForAdmin(filter = {}, { skip = 0, limit = 20 } = {}) {
    return MboForm.find(filter)
      .select(HR_ADMIN_PROJECTION)
      .populate('employeeId', 'name email level department')
      .populate('quarterId', 'label status')
      .skip(skip)
      .limit(limit)
      .sort('-updatedAt');
  }

  async countForAdmin(filter = {}) {
    return MboForm.countDocuments(filter);
  }

  /**
   * For a given list of mentee IDs, returns the single most-recent MBO form
   * per employee. Uses aggregation sort+group to pick the latest form.
   * Employees with no form are NOT in the result — the service layer handles
   * the merge so they appear as { latestForm: null }.
   */
  async findLatestPerEmployee(menteeIds) {
    const mongoose = require('mongoose');
    const objectIds = menteeIds.map((id) =>
      typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id
    );

    const pipeline = [
      { $match: { employeeId: { $in: objectIds } } },
      { $sort: { updatedAt: -1 } },
      {
        $group: {
          _id: '$employeeId',
          formId: { $first: '$_id' },
        },
      },
      {
        $lookup: {
          from: 'mboforms',
          localField: 'formId',
          foreignField: '_id',
          as: 'form',
        },
      },
      { $unwind: '$form' },
      { $replaceRoot: { newRoot: '$form' } },
    ];

    const rawForms = await MboForm.aggregate(pipeline);

    // Populate references after aggregation
    return MboForm.populate(rawForms, [
      { path: 'employeeId', select: 'name email level department' },
      { path: 'quarterId', select: 'label status' },
    ]);
  }

  async updateById(id, data) {
    return MboForm.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  /**
   * Bulk freeze: draft & submitted forms for a closed quarter.
   */
  async freezeByQuarter(quarterId) {
    return MboForm.updateMany(
      { quarterId, status: { $in: ['draft', 'submitted'] } },
      { $set: { status: 'frozen' } }
    );
  }

  async countByQuarter(quarterId) {
    return MboForm.aggregate([
      { $match: { quarterId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
  }
}

module.exports = new MboFormRepository();
