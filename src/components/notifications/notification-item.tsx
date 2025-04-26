"use client"

import { cn } from "@/lib/utils"
import { Bell, MessageSquare, Calendar, GraduationCap, FileCheck, Users } from "lucide-react"
import { formatDistanceToNow } from 'date-fns'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface NotificationItemProps {
  notification: {
    _id: string;
    type: string;
    title: string;
    message: string;
    createdAt: string;
    status: {
      read: boolean;
      readAt?: string;
    };
  };
  onMarkAsRead: (id: string) => Promise<void>;
}

const NotificationIcon = {
  assignment_submitted: FileCheck,
  student_joined: Users,
  student_left: Users,
  class_scheduled: Calendar,
  class_updated: Calendar,
  session_created: Calendar,
  new_message: MessageSquare,
  default: Bell
}

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const Icon = NotificationIcon[notification.type] || NotificationIcon.default

  return (
    <Card className={cn(
      "p-4",
      !notification.status.read && "bg-muted"
    )}>
      <div className="flex items-start gap-4">
        <Icon className="h-5 w-5 mt-1 text-muted-foreground" />
        <div className="flex-1">
          <p className="font-medium">{notification.title}</p>
          <p className="text-sm text-muted-foreground">{notification.message}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </p>
        </div>
        {!notification.status.read && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onMarkAsRead(notification._id)}
          >
            Mark as read
          </Button>
        )}
      </div>
    </Card>
  )
}
