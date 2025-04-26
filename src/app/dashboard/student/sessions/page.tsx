"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Video, BookOpen, Users } from "lucide-react"
import { format, isPast } from "date-fns"
import { toast } from "sonner"
import { PageHeader } from "@/components/layouts/page-header"

interface TeacherInfo {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
}

interface Session {
  _id: string
  subject: {
    name: string
    area: string
  }
  startTime: string
  endTime: string
  duration: number
  meetingLink: string
  status: 'scheduled' | 'active' | 'completed' | 'cancelled'
  teacher: TeacherInfo
  recurrence?: {
    isRecurring: boolean
    pattern: string
    daysOfWeek: number[]
    startDate: string
    endDate: string
    time: string
  }
}

const getStatusColor = (status: string, startTime: string) => {
  const isPastSession = isPast(new Date(startTime))
  
  if (isPastSession && status === 'scheduled') {
    return 'bg-red-500' // Past due sessions
  }

  switch (status.toLowerCase()) {
    case 'scheduled': return 'bg-blue-500'
    case 'active': return 'bg-green-500'
    case 'completed': return 'bg-gray-500'
    case 'cancelled': return 'bg-red-500'
    default: return 'bg-gray-500'
  }
}

const getSessionStatus = (session: Session) => {
  if (!session.recurrence?.isRecurring) {
    // One-time session
    const isPastSession = isPast(new Date(session.startTime))
    if (isPastSession && session.status === 'scheduled') {
      return 'Past Due'
    }
  } else {
    // Recurring session
    const endDate = new Date(session.recurrence.endDate)
    if (isPast(endDate) && session.status === 'scheduled') {
      return 'Series Ended'
    }
  }

  return session.status.charAt(0).toUpperCase() + session.status.slice(1)
}

const isSessionActive = (session: Session) => {
  if (session.recurrence?.isRecurring) {
    // For recurring sessions, check if the series end date hasn't passed
    const endDate = new Date(session.recurrence.endDate)
    return !isPast(endDate)
  }
  // For one-time sessions, check if start time hasn't passed
  return !isPast(new Date(session.startTime))
}

export default function StudentSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/student/sessions')
      if (!response.ok) throw new Error('Failed to fetch sessions')
      const data = await response.json()
      setSessions(data)
    } catch (error) {
      toast.error("Failed to load sessions")
    } finally {
      setLoading(false)
    }
  }

  const formatRecurrenceInfo = (session: Session) => {
    if (!session.recurrence?.isRecurring) return null

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const selectedDays = session.recurrence.daysOfWeek.map(d => days[d]).join(', ')
    const startDate = format(new Date(session.recurrence.startDate), 'PPP')
    const endDate = format(new Date(session.recurrence.endDate), 'PPP')

    return `🔄 ${session.recurrence.pattern} sessions on ${selectedDays} until ${endDate}`
  }

  const renderSession = (session: Session) => {
    const isActiveSession = isSessionActive(session)
    const statusColor = session.recurrence?.isRecurring
      ? session.status === 'cancelled' ? 'bg-red-500' : 'bg-blue-500'
      : getStatusColor(session.status, session.startTime)

    return (
      <Card key={session._id} className="mb-4">
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 gap-4">
          <div className="space-y-2 w-full sm:w-auto">
            {/* Session Header */}
            <div className="flex flex-wrap items-start gap-2">
              <div className="flex items-center space-x-2 flex-1">
                <BookOpen className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium truncate">
                  {session.subject.name}
                  <span className="text-sm text-muted-foreground ml-1">
                    ({session.subject.area})
                  </span>
                </span>
              </div>
              <Badge className={`${statusColor} whitespace-nowrap`}>
                {getSessionStatus(session)}
              </Badge>
            </div>

            {/* Session Details */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="mr-1 h-4 w-4 flex-shrink-0" />
                <span className="truncate">{format(new Date(session.startTime), 'PPP')}</span>
              </div>
              <div className="flex items-center">
                <Clock className="mr-1 h-4 w-4 flex-shrink-0" />
                <span>{format(new Date(session.startTime), 'p')}</span>
              </div>
            </div>

            {/* Teacher Info */}
            <div className="flex items-center space-x-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="truncate">
                <span className="text-muted-foreground">Teacher: </span>
                <span className="font-medium">{session.teacher?.name || "Not assigned"}</span>
              </div>
            </div>

            {/* Recurrence Info */}
            {session.recurrence?.isRecurring && (
              <p className="text-xs text-blue-600 break-words">
                {formatRecurrenceInfo(session)}
              </p>
            )}
          </div>

          {/* Join Button */}
          {session.meetingLink && (
            <Button
              className="w-full sm:w-auto whitespace-nowrap"
              variant={isActiveSession ? "default" : "secondary"}
              disabled={!isActiveSession}
              onClick={() => isActiveSession && window.open(session.meetingLink, '_blank')}
            >
              <Video className="w-4 h-4 mr-2" />
              {isActiveSession ? 'Join Session' : (
                session.recurrence?.isRecurring ? 'Series Ended' : 'Session Ended'
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">My Sessions</h1>
          <p className="text-muted-foreground">View all your scheduled classes</p>
        </div>
        
        {/* Add filter/sort controls here if needed */}
      </div>

      <div className="grid gap-4">
        {loading ? (
          <Card className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          </Card>
        ) : sessions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-48 space-y-4">
              <Calendar className="h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground">No sessions scheduled</p>
            </CardContent>
          </Card>
        ) : (
          sessions.map((session) => renderSession(session))
        )}
      </div>
    </div>
  )
}
