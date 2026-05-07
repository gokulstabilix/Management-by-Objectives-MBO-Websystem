const catchAsync = require('../utils/catchAsync');
const mboFormService = require('../services/mboFormService');

exports.createDraft = catchAsync(async (req, res) => {
  const form = await mboFormService.createDraft(req.user._id, req.body.quarterId, req.body.objectives);
  res.status(201).json({ status: 'success', data: { form } });
});

exports.updateDraft = catchAsync(async (req, res) => {
  const form = await mboFormService.updateDraft(req.params.id, req.user._id, req.body.objectives);
  res.status(200).json({ status: 'success', data: { form } });
});

exports.submitForm = catchAsync(async (req, res) => {
  const form = await mboFormService.submitForm(req.params.id, req.user._id);
  res.status(200).json({ status: 'success', data: { form } });
});

exports.resubmitForm = catchAsync(async (req, res) => {
  const form = await mboFormService.resubmitForm(req.params.id, req.user._id);
  res.status(200).json({ status: 'success', data: { form } });
});

exports.reviewForm = catchAsync(async (req, res) => {
  const { decision, comment } = req.body;
  const form = await mboFormService.reviewForm(req.params.id, req.user._id, decision, comment);
  res.status(200).json({ status: 'success', data: { form } });
});

exports.getMyForms = catchAsync(async (req, res) => {
  const forms = await mboFormService.getMyForms(req.user._id);
  res.status(200).json({ status: 'success', data: { forms } });
});

exports.getMenteeForms = catchAsync(async (req, res) => {
  const forms = await mboFormService.getMenteeForms(req.user._id);
  res.status(200).json({ status: 'success', data: { forms } });
});

exports.getMenteeFormDetail = catchAsync(async (req, res) => {
  const form = await mboFormService.getMenteeFormDetail(req.params.formId, req.user._id);
  res.status(200).json({ status: 'success', data: { form } });
});

exports.listForAdmin = catchAsync(async (req, res) => {
  const result = await mboFormService.listForAdmin(req.query);
  res.status(200).json({ status: 'success', data: result });
});
