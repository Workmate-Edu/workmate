import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface SessionCardProps {
  session: {
    startTime: string
    endTime: string
    subject: {
      name: string
      area: string
    }
    meetingLink?: string
    student?: {
      name: string
      email: string
    }
    teacher?: {
      name: string
      email: string
    }
  }
}

export function SessionCard({ session }: SessionCardProps) {
  const isPastDue = new Date(session.startTime) < new Date()
  const sessionDate = new Date(session.startTime)
  const formattedDate = sessionDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
  const formattedTime = sessionDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  })

  return (
    <Card>
      <CardContent className="p-6">
        {/* Subject and Status */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">
            {session.subject.name} ({session.subject.area})
          </h3>
          {isPastDue && (
            <Badge variant="destructive">Past Due</Badge>
          )}
        </div>

        {/* Session Info */}
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{formattedTime}</span>
          </div>
          {session.teacher && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Teacher: {session.teacher.name}</span>
            </div>
          )}
          {session.student && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Student: {session.student.name}</span>
            </div>
          )}
        </div>

        {/* Join Button */}
        {session.meetingLink && (
          <Button
            className="mt-4 w-full"
            variant={isPastDue ? "secondary" : "default"}
            disabled={isPastDue}
            onClick={() => !isPastDue && window.open(session.meetingLink, '_blank')}
          >
            {isPastDue ? 'Session Ended' : 'Join Session'}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
