"use client"

import { useState } from "react"
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
import { filterAndSortNotifications } from '@/lib/notification-utils'
import { useNotifications } from '@/contexts/notification-context'

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

export default function ParentNotificationsPage() {
  const { 
    notifications = [],
    loading = false,
    markAsRead,
    markAllAsRead,
    clearAll,
    unreadCount = 0,
    fetchNotifications
  } = useNotifications()
  const [activeTab, setActiveTab] = useState('all')

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId)
      await fetchNotifications() // Refetch to sync state
    } catch (error) {
      toast.error("Failed to mark as read")
    }
  }

  const getFilteredNotifications = () => {
    return filterAndSortNotifications(notifications, activeTab)
  }

  return (
    <main className="flex-1">
      <div className="flex-1 space-y-4 p-4 md:container">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 md:pt-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground">View and manage your notifications</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              className="flex items-center justify-center gap-2 w-full sm:w-auto"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              <MailOpen className="h-4 w-4" />
              <span>Mark all read</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center justify-center gap-2 w-full sm:w-auto"
              onClick={clearAll}
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
          <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:inline-flex">
            <TabsTrigger value="all" className="flex-1 sm:flex-none">All</TabsTrigger>
            <TabsTrigger value="unread" className="flex-1 sm:flex-none">
              <span className="hidden sm:inline">Unread</span>
              <span className="sm:hidden">New</span>
              {unreadCount > 0 && (
                <Badge variant="default" className="ml-2">
                  {unreadCount}
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

        {loading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        )}
      </div>
    </main>
  )
}
