"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Video, BookOpen, Users, RefreshCw, MessageSquare } from "lucide-react"
import { format, isPast } from "date-fns"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { formatAssessmentDateTime } from '@/lib/timezone-utils'
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"

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
  teacher: {
    name: string
    email: string
  }
  recurrence?: {
    isRecurring: boolean
    pattern: string
    daysOfWeek: number[]
    startDate: string
    endDate: string
    totalSessions?: number
  }
  timezone: string
}

export default function StudentSessionsPage() {
  const { data: session } = useSession()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

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

    return `${session.recurrence.pattern} sessions on ${selectedDays} until ${endDate}`
  }

  const isSessionActive = (session: Session) => {
    if (session.recurrence?.isRecurring) {
      const endDate = new Date(session.recurrence.endDate)
      return !isPast(endDate)
    }
    return !isPast(new Date(session.startTime))
  }

  const canMessageTeacher = session?.user?.studentProfile?.registeredAs !== 'child'

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">My Sessions</h1>
          <p className="text-muted-foreground">View all your scheduled classes</p>
        </div>
      </div>

      <div className="grid gap-4">
        {sessions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-48 space-y-4">
              <Calendar className="h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground">No sessions scheduled</p>
            </CardContent>
          </Card>
        ) : (
          sessions.map((session) => {
            const { teacherTime, studentTime } = formatAssessmentDateTime({
              dateStr: session.startTime,
              teacherTimezone: session.timezone || 'Africa/Lagos'
            })

            const isActive = isSessionActive(session)

            return (
              <Card key={session._id}>
                <CardContent className="flex flex-col sm:flex-row items-center gap-4 p-4 md:p-6">
                  <div className="flex-1 min-w-0 space-y-3 text-center sm:text-left">
                    {/* Subject & Status */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <BookOpen className="h-4 w-4 flex-shrink-0" />
                        <span className="font-medium truncate">
                          {session.subject.name}
                          <span className="text-sm text-muted-foreground ml-1">
                            ({session.subject.area})
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={cn(
                          "whitespace-nowrap",
                          session.status === 'cancelled' ? "bg-red-500" : 
                          isPast(new Date(session.startTime)) ? "bg-gray-500" : 
                          "bg-green-500"
                        )}>
                          {session.status}
                        </Badge>
                        {session.recurrence?.isRecurring && (
                          <Badge variant="outline" className="flex items-center">
                            <RefreshCw className="mr-1 h-3 w-3" />
                            Recurring
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Time & Teacher Info */}
                    <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 sm:gap-4 text-sm">
                      <div className="flex items-center">
                        <Clock className="mr-1 h-4 w-4 flex-shrink-0" />
                        <div>
                          <div>{studentTime}</div>
                          <div className="text-xs text-muted-foreground">{teacherTime}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Users className="mr-1 h-4 w-4 flex-shrink-0" />
                        <span className="truncate">Teacher: {session.teacher.name}</span>
                      </div>
                    </div>

                    {/* Recurrence Info */}
                    {session.recurrence?.isRecurring && (
                      <div className="text-xs text-blue-600 text-center sm:text-left">
                        {formatRecurrenceInfo(session)}
                      </div>
                    )}
                  </div>

                  {/* Join & Message Buttons */}
                  <div className="flex items-center gap-2 mt-4">
                    <Button
                      variant="default"
                      disabled={session.status === 'cancelled'}
                      onClick={() => window.open(session.meetingLink, '_blank')}
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Join Session
                    </Button>

                    {canMessageTeacher && (
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/dashboard/student/messages?teacherId=${session.teacherId}`)}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Message Teacher
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
