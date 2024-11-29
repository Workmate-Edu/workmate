"use client"

import { Button } from "@/components/ui/button"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FiBell, FiCheck, FiClock, FiTrash2 } from "react-icons/fi"
import { useThemeContext } from "@/hooks/use-theme-context"

export default function NotificationsPage() {
  const { theme } = useThemeContext()

  // Mock data - would come from API in real app
  const notifications = {
    unread: [
      {
        id: 1,
        title: "Assignment Due Tomorrow",
        message: "John's Mathematics assignment is due tomorrow at 3:00 PM",
        time: "2 hours ago",
        type: "assignment",
      },
      {
        id: 2,
        title: "New Grade Posted",
        message: "Jane received an A in Biology Quiz",
        time: "5 hours ago",
        type: "grade",
      },
      {
        id: 3,
        title: "Parent-Teacher Meeting",
        message: "Upcoming meeting with Dr. Sarah Johnson on Friday",
        time: "1 day ago",
        type: "meeting",
      },
    ],
    read: [
      {
        id: 4,
        title: "Course Registration Open",
        message: "Spring semester course registration is now open",
        time: "2 days ago",
        type: "announcement",
      },
      {
        id: 5,
        title: "School Event",
        message: "Annual Science Fair next month",
        time: "3 days ago",
        type: "event",
      },
    ],
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "assignment":
        return <FiClock className="w-5 h-5 text-blue-500" />
      case "grade":
        return <FiCheck className="w-5 h-5 text-green-500" />
      case "meeting":
        return <FiBell className="w-5 h-5 text-purple-500" />
      default:
        return <FiBell className="w-5 h-5 text-gray-500" />
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className={`text-3xl font-bold ${theme.text.light}`}>Notifications</h2>
          <div className="flex gap-2">
            <Button variant="outline" className={theme.button.outline}>Mark All as Read</Button>
            <Button variant="outline" className={theme.button.outline}>
              <FiTrash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="unread" className="space-y-4">
          <TabsList>
            <TabsTrigger value="unread">
              Unread <span className="ml-2 bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">{notifications.unread.length}</span>
            </TabsTrigger>
            <TabsTrigger value="read">Read</TabsTrigger>
          </TabsList>

          <TabsContent value="unread" className="space-y-4">
            {notifications.unread.map((notification) => (
              <Card 
                key={notification.id} 
                className={`p-4 hover:shadow-md transition-shadow ${theme.background.light}`}
              >
                <div className="flex gap-4">
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <h3 className={`font-semibold ${theme.text.light}`}>{notification.title}</h3>
                      <span className="text-sm text-muted-foreground">{notification.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="read" className="space-y-4">
            {notifications.read.map((notification) => (
              <Card 
                key={notification.id} 
                className={`p-4 hover:shadow-md transition-shadow bg-background`}
              >
                <div className="flex gap-4">
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <h3 className={`font-semibold text-gray-600 ${theme.text.light}`}>{notification.title}</h3>
                      <span className="text-sm text-muted-foreground">{notification.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
