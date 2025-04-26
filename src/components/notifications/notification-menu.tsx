"use client"

import { useState, useEffect } from 'react'
import { Bell, Loader2 } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { NotificationItem } from './notification-item'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useSocketContext } from '@/contexts/socket-context'

interface Notification {
  _id: string
  type: string
  title: string
  message: string
  status: {
    read: boolean
  }
  createdAt: string
}

export function NotificationMenu() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const { socket } = useSocketContext()
  const router = useRouter()
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    fetchNotifications()
  }, [])

  useEffect(() => {
    if (!socket || !session?.user?.id) return

    // Listen for new notifications
    socket.on('new_notification', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev])
      setUnreadCount(prev => prev + 1)
    })

    return () => {
      socket.off('new_notification')
    }
  }, [socket, session?.user?.id])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/notifications?limit=10')
      const data = await res.json()
      
      if (data.notifications) {
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST'
      })
      setUnreadCount(prev => Math.max(0, prev - 1))
      setNotifications(prev => prev.map(n => 
        n._id === notificationId ? { ...n, status: { ...n.status, read: true }} : n
      ))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const getNotificationPath = () => {
    switch (session?.user?.role) {
      case 'student':
        return '/dashboard/student/notifications'
      case 'teacher':
        return '/dashboard/teacher/notifications'
      case 'parent':
        return '/dashboard/parent/notifications'
      default:
        return '/dashboard/notifications'
    }
  }

  const handleViewAll = () => {
    const notificationPath = getNotificationPath()
    setIsOpen(false) // Close popover
    router.push(notificationPath) // Use the dynamic path based on user role
  }

  const handleNotificationClick = (notification: Notification) => {
    const notificationPath = getNotificationPath()
    setIsOpen(false)
    handleMarkAsRead(notification._id)
    router.push(notificationPath)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">Notifications</h4>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleViewAll}
          >
            View all
          </Button>
        </div>
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : notifications.length > 0 ? (
            <div className="p-4 space-y-4">
              {notifications.map((notification) => (
                <div 
                  key={notification._id} 
                  onClick={() => handleNotificationClick(notification)}
                  className="cursor-pointer"
                >
                  <NotificationItem
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
