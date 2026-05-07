const catchAsync = require('../utils/catchAsync');
const notificationService = require('../services/notificationService');

exports.getNotifications = catchAsync(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 30, 1), 100);
  const skip = (page - 1) * limit;

  const result = await notificationService.getUserNotifications(req.user._id, { skip, limit });
  res.status(200).json({ status: 'success', data: result });
});

exports.markRead = catchAsync(async (req, res) => {
  const notif = await notificationService.markRead(req.params.id, req.user._id);
  res.status(200).json({ status: 'success', data: { notification: notif } });
});

exports.markAllRead = catchAsync(async (req, res) => {
  await notificationService.markAllRead(req.user._id);
  res.status(200).json({ status: 'success', message: 'All notifications marked as read.' });
});
