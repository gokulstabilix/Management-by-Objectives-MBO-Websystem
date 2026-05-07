const catchAsync = require('../utils/catchAsync');
const mentorMapService = require('../services/mentorMapService');

exports.assignMentor = catchAsync(async (req, res) => {
  const { employeeId, mentorId } = req.body;
  const user = await mentorMapService.assignMentor(employeeId, mentorId);
  res.status(201).json({ status: 'success', data: { user } });
});

exports.listMappings = catchAsync(async (_req, res) => {
  const mappings = await mentorMapService.listMappings();
  res.status(200).json({ status: 'success', data: { mappings } });
});

exports.updateMentor = catchAsync(async (req, res) => {
  const { mentorId } = req.body;
  const user = await mentorMapService.updateMentor(req.params.employeeId, mentorId);
  res.status(200).json({ status: 'success', data: { user } });
});

exports.removeMentor = catchAsync(async (req, res) => {
  await mentorMapService.removeMentor(req.params.employeeId);
  res.status(200).json({ status: 'success', message: 'Mentor removed. MBO history preserved.' });
});
