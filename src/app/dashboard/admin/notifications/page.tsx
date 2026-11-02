"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  MailOpen, 
} from "lucide-react"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { EmptyState } from "@/components/notifications/empty-state"
import { NotificationItem } from "@/components/notifications/notification-item"

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

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/notifications?limit=100')
      if (!res.ok) throw new Error('Failed to fetch notifications')
      const data = await res.json()
      setNotifications(data.notifications || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast.error("Failed to load notifications")
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications/mark-all-read', { method: 'POST' })
      setNotifications(prev => prev.map(n => ({
        ...n,
        status: { ...n.status, read: true, readAt: new Date().toISOString() }
      })))
      toast.success("All notifications marked as read")
    } catch (error) {
      toast.error("Failed to mark notifications as read")
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const res = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST'
      })
      if (!res.ok) throw new Error('Failed to mark notification as read')
      
      setNotifications(prev => prev.map(n => 
        n._id === notificationId 
          ? { ...n, status: { ...n.status, read: true, readAt: new Date().toISOString() }}
          : n
      ))
    } catch (error) {
      console.error('Error marking notification as read:', error)
      toast.error("Failed to mark notification as read")
    }
  }

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter(n => !n.status.read)
      case 'read':
        return notifications.filter(n => n.status.read)
      case 'alerts':
        return notifications.filter(n => 
          n.type === 'system_alert' || n.type === 'security_alert'
        )
      default:
        return notifications
    }
  }

  if (loading) {
    return (
      <main className="flex-1">
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1">
      <div className="flex-1 space-y-4 container">
        <div className="flex justify-between items-center pt-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">System Notifications</h1>
            <p className="text-muted-foreground">Monitor system activities and user management</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={handleMarkAllRead}
            >
              <MailOpen className="h-4 w-4" />
              Mark all read
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">
              Unread {notifications.filter(n => !n.status.read).length > 0 && (
                <Badge variant="default" className="ml-2">
                  {notifications.filter(n => !n.status.read).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="read">Read</TabsTrigger>
            <TabsTrigger value="alerts">
              System Alerts
              {notifications.filter(n => n.type === 'system_alert' || n.type === 'security_alert').length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {notifications.filter(n => n.type === 'system_alert' || n.type === 'security_alert').length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <ScrollArea className="h-[calc(100vh-13rem)]">
              <div className="space-y-4 pb-8">
                {getFilteredNotifications().length > 0 ? (
                  getFilteredNotifications().map((notification) => (
                    <NotificationItem
                      key={notification._id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                    />
                  ))
                ) : (
                  <EmptyState 
                    title={`No ${activeTab} notifications`}
                    message={activeTab === 'unread' ? "You're all caught up!" : "No notifications to show"}
                  />
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
