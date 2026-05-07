const catchAsync = require('../utils/catchAsync');
const userService = require('../services/userService');

exports.createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(201).json({ status: 'success', data: { user } });
});

exports.listUsers = catchAsync(async (req, res) => {
  const result = await userService.listUsers(req.query);
  res.status(200).json({ status: 'success', data: result });
});

exports.getUser = catchAsync(async (req, res) => {
  const result = await userService.getUserProfile(req.params.id);
  res.status(200).json({ status: 'success', data: result });
});

exports.updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);
  res.status(200).json({ status: 'success', data: { user } });
});

exports.deactivateUser = catchAsync(async (req, res) => {
  await userService.deactivateUser(req.params.id, req.user._id);
  res.status(200).json({ status: 'success', message: 'User deactivated.' });
});
