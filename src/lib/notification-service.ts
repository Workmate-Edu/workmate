import { Notification } from "@/models/notification"
import { getSocket } from "@/lib/socket"  // Use existing socket client

interface NotificationData {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  priority?: 'low' | 'medium' | 'high';
}


export async function createNotification(data: NotificationData) {
  try {
    const notification = await Notification.create({
      ...data,
      status: { read: false },
      delivery: {
        inApp: true,
        email: data.priority === 'high',
        push: data.priority === 'high'
      }
    });

    // Use existing socket client
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit('notification', {
        type: 'new_notification',
        notification,
        userId: data.userId
      });
    }

    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    throw error;
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    if (!notificationId || notificationId === 'undefined') {
      throw new Error('Notification ID is required');
    }

    // Use _id for MongoDB queries
    const notification = await Notification.findByIdAndUpdate(
      { _id: notificationId },
      {
        'status.read': true,
        'status.readAt': new Date()
      },
      { new: true }
    );

    if (!notification) {
      throw new Error('Notification not found');
    }

    return notification;
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    throw error;
  }
}

export async function sendSessionNotification(data: {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
}) {
  try {
    const notification = await createNotification({
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      data: data.data,
      priority: 'high'
    });

    // Emit notification with full data
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit('notification', {
        type: 'new_notification',
        notification: {
          ...notification.toObject(),
          createdAt: new Date().toISOString()
        },
        userId: data.userId
      });
    }

    return notification;
  } catch (error) {
    console.error('Failed to send notification:', error);
    throw error;
  }
}
