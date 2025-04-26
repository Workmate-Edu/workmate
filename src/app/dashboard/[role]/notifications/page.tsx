"use client"

import { NotificationItem } from "@/components/notifications/notification-item"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      if (!notificationId) {
        console.error('No notification ID provided');
        return;
      }

      console.log('Marking notification as read:', notificationId);

      const res = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST'
      });

      if (!res.ok) {
        throw new Error('Failed to mark notification as read');
      }

      setNotifications(prev => 
        prev.map(n => n._id === notificationId 
          ? { ...n, status: { ...n.status, read: true }} 
          : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification._id}
          notification={notification}
          onMarkAsRead={handleMarkAsRead}
        />
      ))}
    </div>
  );
}
