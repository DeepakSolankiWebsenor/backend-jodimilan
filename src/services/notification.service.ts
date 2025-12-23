import { Notification } from '../models';

interface NotificationData {
  topic: string;
  message: string;
  name?: string; // e.g., 'System' or sender name
  [key: string]: any;
}

export class NotificationService {
  /**
   * Create a new notification
   * @param userId The recipient user ID
   * @param type The type of notification (e.g., 'system', 'social', 'account')
   * @param data The payload data (topic, message, etc.)
   * @param notifiableType The entity type related to this notification (optional)
   * @param notifiableId The entity ID related to this notification (optional)
   */
  static async createNotification(
    userId: number,
    type: string,
    data: NotificationData,
    notifiableType: string = 'System',
    notifiableId: number = 0
  ) {
    try {
      await Notification.create({
        user_id: userId,
        type,
        data: JSON.stringify(data),
        notifiable_type: notifiableType,
        notifiable_id: notifiableId,
        read_at: null,
      });
    } catch (error) {
      console.error('Failed to create notification:', error);
      // We generally don't want to crash the request if a notification fails
    }
  }

  /**
   * Mark all notifications as read for a user
   * @param userId 
   */
  static async markAllAsRead(userId: number) {
    await Notification.update(
      { read_at: new Date() },
      { where: { user_id: userId, read_at: null } }
    );
  }
}
