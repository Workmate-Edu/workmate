"use client"

import { createContext, useContext, useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useSocketContext } from './socket-context'

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  status: {
    read: boolean;
    readAt?: string;
  };
  createdAt: string;
  data?: any;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAll: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  loading: true,
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  clearAll: async () => {},
  fetchNotifications: async () => {}
})

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const { socket } = useSocketContext()
  const { data: session } = useSession()

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/notifications')
      if (!res.ok) throw new Error('Failed to fetch notifications')
      const data = await res.json()
      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  // Socket event handlers
  useEffect(() => {
    if (!socket || !session?.user?.id) return

    socket.on('notification', async (data) => {
      if (data.type === 'new_notification') {
        await fetchNotifications() // Refresh notifications
      }
    })

    return () => {
      socket.off('notification')
    }
  }, [socket, session?.user?.id])

  // Initial fetch
  useEffect(() => {
    if (session?.user?.id) {
      fetchNotifications()
    }
  }, [session?.user?.id])

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to mark as read')
      await fetchNotifications() // Refresh after marking as read
    } catch (error) {
      console.error('Error marking as read:', error)
      throw error
    }
  }

  const markAllAsRead = async () => {
    try {
      const res = await fetch('/api/notifications/read-all', { method: 'POST' })
      if (!res.ok) throw new Error('Failed to mark all as read')
      await fetchNotifications() // Refresh after marking all as read
    } catch (error) {
      console.error('Error marking all as read:', error)
      throw error
    }
  }

  const clearAll = async () => {
    try {
      const res = await fetch('/api/notifications/clear-all', { method: 'POST' })
      if (!res.ok) throw new Error('Failed to clear all notifications')
      await fetchNotifications() // Refresh after clearing all
    } catch (error) {
      console.error('Error clearing all notifications:', error)
      throw error
    }
  }

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      markAsRead,
      markAllAsRead,
      clearAll,
      fetchNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => useContext(NotificationContext)
