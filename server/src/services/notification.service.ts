import { Notification, type NotificationDocument } from "../models/Notification.js";
import { Types } from "mongoose";

export class NotificationService {
  /**
   * Gets notifications for a specific user
   */
  async getNotifications(params: {
    userId: string | Types.ObjectId;
    page?: number;
    limit?: number;
    isRead?: boolean;
    category?: string;
  }) {
    const { userId, page = 1, limit = 20, isRead, category } = params;

    const query: any = { recipientId: userId };
    if (isRead !== undefined) query.isRead = isRead;
    if (category) query.category = category;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({ recipientId: userId, isRead: false }),
    ]);

    return {
      notifications,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      unreadCount,
    };
  }

  /**
   * Marks a notification as read
   */
  async markAsRead(userId: string | Types.ObjectId, notificationId: string) {
    return Notification.findOneAndUpdate(
      { _id: notificationId, recipientId: userId },
      { $set: { isRead: true, readAt: new Date() } },
      { new: true }
    );
  }

  /**
   * Marks all notifications as read for a user
   */
  async markAllAsRead(userId: string | Types.ObjectId) {
    return Notification.updateMany(
      { recipientId: userId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );
  }

  /**
   * Deletes a notification
   */
  async deleteNotification(userId: string | Types.ObjectId, notificationId: string) {
    return Notification.findOneAndDelete({ _id: notificationId, recipientId: userId });
  }

  /**
   * Gets unread count for a user
   */
  async getUnreadCount(userId: string | Types.ObjectId) {
    return Notification.countDocuments({ recipientId: userId, isRead: false });
  }
}

export const notificationService = new NotificationService();
