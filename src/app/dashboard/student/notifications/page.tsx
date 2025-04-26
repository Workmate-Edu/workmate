"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, MailOpen, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { EmptyState } from "@/components/notifications/empty-state"
import { NotificationItem } from "@/components/notifications/notification-item"
import { useSocketContext } from "@/contexts/socket-context"
import { filterAndSortNotifications } from '@/lib/notification-utils';

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

export default function StudentNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const { socket } = useSocketContext()

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/notifications')
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

  const handleClearAll = async () => {
    try {
      await fetch('/api/notifications/clear-all', { method: 'DELETE' })
      setNotifications([])
      toast.success("All notifications cleared")
    } catch (error) {
      toast.error("Failed to clear notifications")
    }
  }

  const getFilteredNotifications = () => {
    return filterAndSortNotifications(notifications, activeTab);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const res = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST'
      })

      if (!res.ok) {
        throw new Error('Failed to mark notification as read')
      }

      // Update local state
      setNotifications(prev => prev.map(n => 
        n._id === notificationId 
          ? { ...n, status: { ...n.status, read: true }} 
          : n
      ))

      toast.success("Notification marked as read")
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      toast.error("Failed to mark notification as read")
    }
  }

  return (
    <main className="flex-1">
      <div className="flex-1 space-y-4 p-4 md:container">
        {/* Header - More responsive */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 md:pt-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground">View and manage your notifications</p>
          </div>
          
          {/* Action Buttons - Stack on mobile */}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              className="flex items-center justify-center gap-2 w-full sm:w-auto"
              onClick={handleMarkAllRead}
              disabled={notifications.filter(n => !n.status.read).length === 0}
            >
              <MailOpen className="h-4 w-4" />
              <span>Mark all read</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center justify-center gap-2 w-full sm:w-auto"
              onClick={handleClearAll}
              disabled={notifications.length === 0}
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear all</span>
            </Button>
          </div>
        </div>

        <Tabs 
          defaultValue="all" 
          className="space-y-4"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          {/* Responsive Tabs */}
          <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:inline-flex">
            <TabsTrigger value="all" className="flex-1 sm:flex-none">All</TabsTrigger>
            <TabsTrigger value="unread" className="flex-1 sm:flex-none">
              <span className="hidden sm:inline">Unread</span>
              <span className="sm:hidden">New</span>
              {notifications.filter(n => !n.status.read).length > 0 && (
                <Badge variant="default" className="ml-2">
                  {notifications.filter(n => !n.status.read).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="read" className="flex-1 sm:flex-none">Read</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <ScrollArea className="h-[calc(100vh-16rem)]">
              <div className="space-y-2 pb-8">
                {getFilteredNotifications().length > 0 ? (
                  getFilteredNotifications().map((notification) => (
                    <NotificationItem
                      key={notification._id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                      className="animate-in fade-in-50"
                    />
                  ))
                ) : (
                  <Card className="p-8">
                    <EmptyState 
                      title={`No ${activeTab} notifications`}
                      message={activeTab === 'unread' ? "You're all caught up!" : "No notifications to show"}
                      icon={Bell}
                    />
                  </Card>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Loading State */}
        {loading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        )}
      </div>
    </main>
  )
}
