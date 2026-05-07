const notificationRepository = require('../repositories/notificationRepository');
const userRepository = require('../repositories/userRepository');
const { NOTIFICATION_TYPES } = require('../config/constants');

class NotificationService {
  /**
   * Dispatch a notification to one or many users.
   * @param {string}   type         - NOTIFICATION_TYPES enum value
   * @param {string[]} recipientIds - Array of user ObjectId strings
   * @param {string}   message      - Notification message
   * @param {string|null} refId     - Related MboForm or Quarter _id
   */
  async dispatch(type, recipientIds, message, refId = null) {
    if (!recipientIds || recipientIds.length === 0) return;

    const docs = recipientIds.map((userId) => ({
      userId,
      type,
      message,
      refId,
      isRead: false,
    }));

    await notificationRepository.createMany(docs);
  }

  /** Notify mentor when mentee submits / resubmits */
  async notifyFormSubmitted(mentorId, employeeName, formId) {
    await this.dispatch(
      NOTIFICATION_TYPES.FORM_SUBMITTED,
      [mentorId],
      `${employeeName} has submitted their MBO form for review.`,
      formId
    );
  }

  /** Notify employee when mentor approves */
  async notifyFormApproved(employeeId, formId) {
    await this.dispatch(
      NOTIFICATION_TYPES.FORM_APPROVED,
      [employeeId],
      'Your MBO form has been approved by your mentor.',
      formId
    );
  }

  /** Notify employee when mentor rejects */
  async notifyFormRejected(employeeId, formId) {
    await this.dispatch(
      NOTIFICATION_TYPES.FORM_REJECTED,
      [employeeId],
      'Your MBO form has been rejected by your mentor. Please revise and resubmit.',
      formId
    );
  }

  /** Notify all active employees when quarter opens */
  async notifyQuarterOpened(quarterId, quarterLabel) {
    const employees = await userRepository.findAllActiveEmployees();
    const ids = employees.map((e) => e._id.toString());
    await this.dispatch(
      NOTIFICATION_TYPES.QUARTER_OPENED,
      ids,
      `Quarter ${quarterLabel} is now open. You may begin your MBO submissions.`,
      quarterId
    );
  }

  /** Notify all active employees when quarter closes */
  async notifyQuarterClosed(quarterId, quarterLabel) {
    const employees = await userRepository.findAllActiveEmployees();
    const ids = employees.map((e) => e._id.toString());
    await this.dispatch(
      NOTIFICATION_TYPES.QUARTER_CLOSED,
      ids,
      `Quarter ${quarterLabel} has been closed. Draft and submitted forms are now frozen.`,
      quarterId
    );
  }

  /** Get user's notifications */
  async getUserNotifications(userId, pagination) {
    const [notifications, unreadCount] = await Promise.all([
      notificationRepository.findByUser(userId, pagination),
      notificationRepository.countUnread(userId),
    ]);
    return { notifications, unreadCount };
  }

  /** Mark single notification as read */
  async markRead(notificationId, userId) {
    const notif = await notificationRepository.markRead(notificationId, userId);
    if (!notif) {
      const AppError = require('../utils/AppError');
      throw new AppError('Notification not found.', 404);
    }
    return notif;
  }

  /** Mark all as read */
  async markAllRead(userId) {
    return notificationRepository.markAllRead(userId);
  }
}

module.exports = new NotificationService();
