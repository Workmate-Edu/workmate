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
import { useNotifications } from '@/contexts/notification-context'

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
  const { data: session, status } = useSession()
  const { 
    notifications = [], 
    unreadCount = 0, 
    markAsRead, 
    loading,
    fetchNotifications 
  } = useNotifications()
  
  // Only show notifications if authenticated
  if (status !== 'authenticated') {
    return null
  }

  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const { socket } = useSocketContext()

  // Add real-time updates with socket
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

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId)
      await fetchNotifications() // Refetch after marking as read
    } catch (error) {
      console.error('Failed to mark as read:', error)
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

  const handleNotificationClick = async (notification: Notification) => {
    const notificationPath = getNotificationPath()
    setIsOpen(false)
    
    // Only mark as read if not already read
    if (!notification.status.read) {
      await handleMarkAsRead(notification._id)
    }
    
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
          ) : Array.isArray(notifications) && notifications.length > 0 ? (
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
