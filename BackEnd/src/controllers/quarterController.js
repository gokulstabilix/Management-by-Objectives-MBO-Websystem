const catchAsync = require('../utils/catchAsync');
const quarterService = require('../services/quarterService');

exports.createQuarter = catchAsync(async (req, res) => {
  const quarter = await quarterService.createQuarter(req.body.label, req.user._id);
  res.status(201).json({ status: 'success', data: { quarter } });
});

exports.closeQuarter = catchAsync(async (req, res) => {
  const quarter = await quarterService.closeQuarter(req.params.id, req.user._id);
  res.status(200).json({ status: 'success', data: { quarter } });
});

exports.listQuarters = catchAsync(async (_req, res) => {
  const quarters = await quarterService.listQuarters();
  res.status(200).json({ status: 'success', data: { quarters } });
});

exports.getQuarter = catchAsync(async (req, res) => {
  const quarter = await quarterService.getQuarter(req.params.id);
  res.status(200).json({ status: 'success', data: { quarter } });
});
