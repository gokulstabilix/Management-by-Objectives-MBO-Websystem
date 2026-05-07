const catchAsync = require('../utils/catchAsync');
const authService = require('../services/authService');

exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password, res);
  res.status(200).json({ status: 'success', data: result });
});

exports.refresh = catchAsync(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  const result = await authService.refresh(refreshToken, res);
  res.status(200).json({ status: 'success', data: result });
});

exports.logout = catchAsync(async (_req, res) => {
  authService.logout(res);
  res.status(200).json({ status: 'success', message: 'Logged out successfully.' });
});

exports.changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user._id, currentPassword, newPassword);
  res.status(200).json({ status: 'success', message: 'Password changed successfully.' });
});
