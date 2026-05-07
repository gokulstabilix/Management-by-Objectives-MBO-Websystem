const Notification = require('../models/Notification');

class NotificationRepository {
  async createMany(docs) {
    return Notification.insertMany(docs);
  }

  async findByUser(userId, { skip = 0, limit = 30 } = {}) {
    return Notification.find({ userId })
      .sort({ isRead: 1, createdAt: -1 }) // unread first
      .skip(skip)
      .limit(limit);
  }

  async countUnread(userId) {
    return Notification.countDocuments({ userId, isRead: false });
  }

  async markRead(notificationId, userId) {
    return Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true },
      { new: true }
    );
  }

  async markAllRead(userId) {
    return Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } }
    );
  }
}

module.exports = new NotificationRepository();
