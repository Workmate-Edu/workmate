"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Calendar, Video } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface SessionNotificationProps {
  notification: {
    type: string
    title: string
    message: string
    createdAt: string
    data: {
      sessionId: string
      meetingLink?: string
    }
  }
  onDismiss: () => void
}

export function SessionNotification({ notification, onDismiss }: SessionNotificationProps) {
  const handleJoinMeeting = () => {
    if (notification.data.meetingLink) {
      window.open(notification.data.meetingLink, '_blank');
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <div>
            <h4 className="font-semibold">{notification.title}</h4>
            <p className="text-sm text-muted-foreground">{notification.message}</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </p>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onDismiss}>
          Dismiss
        </Button>
        {notification.data.meetingLink && (
          <Button 
            size="sm" 
            onClick={handleJoinMeeting}
            className="flex items-center gap-2"
          >
            <Video className="h-4 w-4" />
            Join Meeting
          </Button>
        )}
      </div>
    </Card>
  )
}
