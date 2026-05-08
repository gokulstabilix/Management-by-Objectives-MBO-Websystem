const mboFormRepository = require('../repositories/mboFormRepository');
const userRepository = require('../repositories/userRepository');
const quarterRepository = require('../repositories/quarterRepository');
const notificationService = require('./notificationService');
const { assertTransition } = require('./statusTransitionGuard');
const AppError = require('../utils/AppError');

class MboFormService {
  /** Ensure the form is not locked before any write. */
  _assertNotLocked(form) {
    if (form.isLocked) {
      throw new AppError('This form is approved and permanently locked. No edits allowed.', 403);
    }
  }

  /** Create draft MBO form. */
  async createDraft(employeeId, quarterId, objectives) {
    const [employee, quarter] = await Promise.all([
      userRepository.findById(employeeId),
      quarterRepository.findById(quarterId),
    ]);
    if (!employee) throw new AppError('Employee not found.', 404);
    if (!quarter) throw new AppError('Quarter not found.', 404);
    if (quarter.status !== 'open') throw new AppError('Quarter is not open.', 400);
    if (!employee.mentorId) throw new AppError('You must have a mentor assigned before submitting MBO forms.', 400);

    const existing = await mboFormRepository.findByEmployeeAndQuarter(employeeId, quarterId);
    if (existing) throw new AppError('You already have an MBO form for this quarter.', 400);

    return mboFormRepository.create({ employeeId, quarterId, objectives, status: 'draft' });
  }

  /** Update draft objectives. */
  async updateDraft(formId, employeeId, objectives) {
    const form = await mboFormRepository.findById(formId);
    if (!form) throw new AppError('MBO form not found.', 404);
    if (form.employeeId.toString() !== employeeId.toString()) throw new AppError('Access denied.', 403);
    this._assertNotLocked(form);
    if (form.status !== 'draft' && form.status !== 'rejected') {
      throw new AppError('Only draft or rejected forms can be edited.', 400);
    }
    return mboFormRepository.updateById(formId, { objectives });
  }

  /** Submit form (draft → submitted). */
  async submitForm(formId, employeeId) {
    const form = await mboFormRepository.findById(formId);
    if (!form) throw new AppError('MBO form not found.', 404);
    if (form.employeeId.toString() !== employeeId.toString()) throw new AppError('Access denied.', 403);
    this._assertNotLocked(form);
    assertTransition(form.status, 'submit', 'employee');
    if (!form.objectives || form.objectives.length === 0) {
      throw new AppError('Cannot submit a form with no objectives.', 400);
    }

    const updated = await mboFormRepository.updateById(formId, {
      status: 'submitted', submittedAt: new Date(), $inc: { submissionCount: 1 },
    });

    const employee = await userRepository.findById(employeeId);
    if (employee && employee.mentorId) {
      await notificationService.notifyFormSubmitted(employee.mentorId, employee.name, formId);
    }
    return updated;
  }

  /** Resubmit after rejection (rejected → submitted). */
  async resubmitForm(formId, employeeId) {
    const form = await mboFormRepository.findById(formId);
    if (!form) throw new AppError('MBO form not found.', 404);
    if (form.employeeId.toString() !== employeeId.toString()) throw new AppError('Access denied.', 403);
    this._assertNotLocked(form);
    assertTransition(form.status, 'resubmit', 'employee');

    const updated = await mboFormRepository.updateById(formId, {
      status: 'submitted', submittedAt: new Date(),
      $inc: { submissionCount: 1 }, mentorReview: null,
    });

    const employee = await userRepository.findById(employeeId);
    if (employee && employee.mentorId) {
      await notificationService.notifyFormSubmitted(employee.mentorId, employee.name, formId);
    }
    return updated;
  }

  /** Mentor reviews (approve/reject). */
  async reviewForm(formId, mentorUserId, decision, comment) {
    const form = await mboFormRepository.findById(formId);
    if (!form) throw new AppError('MBO form not found.', 404);
    this._assertNotLocked(form);

    const employee = await userRepository.findById(form.employeeId);
    if (!employee || employee.mentorId.toString() !== mentorUserId.toString()) {
      throw new AppError('You are not the mentor of this employee.', 403);
    }

    const actorRole = 'mentor';
    const action = decision === 'approve' ? 'approve' : 'reject';
    const nextStatus = assertTransition(form.status, action, actorRole);

    const updateData = {
      status: nextStatus,
      mentorReview: { decision, comment, reviewedAt: new Date(), mentorId: mentorUserId },
    };

    if (nextStatus === 'approved') updateData.isLocked = true;

    const updated = await mboFormRepository.updateById(formId, updateData);

    if (decision === 'approve') {
      await notificationService.notifyFormApproved(form.employeeId, formId);
    } else {
      await notificationService.notifyFormRejected(form.employeeId, formId);
    }
    return updated;
  }

  /** Employee's own forms. */
  async getMyForms(employeeId) {
    return mboFormRepository.findByEmployee(employeeId);
  }

  /** Get a single form by ID for the owning employee. */
  async getFormById(formId, employeeId) {
    const form = await mboFormRepository.findByIdFull(formId);
    if (!form) throw new AppError('MBO form not found.', 404);
    const formEmpId = form.employeeId?._id || form.employeeId;
    if (formEmpId.toString() !== employeeId.toString()) {
      throw new AppError('Access denied.', 403);
    }
    return form;
  }

  /** Mentor's mentee forms. */
  async getMenteeForms(mentorId) {
    const mentees = await userRepository.findMentees(mentorId);
    const menteeIds = mentees.map((m) => m._id);
    return mboFormRepository.findByMentees(menteeIds);
  }

  /** Mentor reads a specific mentee form. */
  async getMenteeFormDetail(formId, mentorId) {
    const form = await mboFormRepository.findByIdFull(formId);
    if (!form) throw new AppError('MBO form not found.', 404);
    const employee = await userRepository.findById(form.employeeId._id || form.employeeId);
    if (!employee || employee.mentorId.toString() !== mentorId.toString()) {
      throw new AppError('You are not the mentor of this employee.', 403);
    }
    return form;
  }

  /** HR/Admin: status-only list. */
  async listForAdmin(query) {
    const filter = {};
    if (query.quarterId) filter.quarterId = query.quarterId;
    if (query.status) filter.status = query.status;

    const page = Math.max(parseInt(query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const [forms, total] = await Promise.all([
      mboFormRepository.findAllForAdmin(filter, { skip, limit }),
      mboFormRepository.countForAdmin(filter),
    ]);
    return { forms, total, page, limit, pages: Math.ceil(total / limit) };
  }
}

module.exports = new MboFormService();
