"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Video, BookOpen, User, RefreshCw } from "lucide-react"
import { format, isPast } from "date-fns"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { formatAssessmentDateTime } from '@/lib/timezone-utils'

interface TeacherSession {
  _id: string
  subject: {
    name: string
    area: string
  }
  student: {
    name: string
    email: string
  }
  startTime: string
  endTime: string
  duration: number
  meetingLink: string
  status: 'scheduled' | 'active' | 'completed' | 'cancelled'
  timezone: string
  recurrence?: {
    isRecurring: boolean
    pattern: string
    daysOfWeek: number[]
    startDate: string
    endDate: string
    totalSessions?: number
  }
}

export default function TeacherSchedulePage() {
  const [sessions, setSessions] = useState<TeacherSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/teacher/sessions')
      if (!response.ok) throw new Error('Failed to fetch sessions')
      const data = await response.json()
      setSessions(data)
    } catch (error) {
      toast.error("Failed to load sessions")
    } finally {
      setLoading(false)
    }
  }

  const formatRecurrenceInfo = (session: TeacherSession) => {
    if (!session.recurrence?.isRecurring) return null

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const selectedDays = session.recurrence.daysOfWeek.map(d => days[d]).join(', ')
    const startDate = format(new Date(session.recurrence.startDate), 'PPP')
    const endDate = format(new Date(session.recurrence.endDate), 'PPP')

    return `${session.recurrence.pattern} sessions on ${selectedDays} until ${endDate}`
  }

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
          <h1 className="text-2xl md:text-3xl font-bold">Teaching Schedule</h1>
          <p className="text-muted-foreground">Manage your upcoming sessions</p>
        </div>
      </div>

      <div className="grid gap-4">
        {sessions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-48 space-y-4">
              <Calendar className="h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground">No scheduled sessions</p>
            </CardContent>
          </Card>
        ) : (
          sessions.map((session) => {
            const { teacherTime, studentTime } = formatAssessmentDateTime({
              dateStr: session.startTime,
              teacherTimezone: session.timezone || 'Africa/Lagos'
            })

            return (
              <Card key={session._id}>
                <CardContent className="p-4 md:p-6">
                  <div className="flex-1 space-y-4">
                    {/* Subject & Status */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 flex-shrink-0" />
                        <span className="font-medium">
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

                    {/* Schedule Container */}
                    <div className="space-y-4">
                      {/* Time & Student Info */}
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center">
                          <Clock className="mr-1 h-4 w-4 flex-shrink-0" />
                          <div>
                            <div>{teacherTime}</div>
                            <div className="text-xs text-muted-foreground">
                              Student's time: {studentTime}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <User className="mr-1 h-4 w-4 flex-shrink-0" />
                          <span>Student: {session.student.name}</span>
                        </div>
                      </div>

                      {/* Recurrence Info */}
                      {session.recurrence?.isRecurring && (
                        <div className="text-xs text-blue-600">
                          {formatRecurrenceInfo(session)}
                        </div>
                      )}

                      {/* Join Button */}
                      <Button
                        className="w-full"
                        variant="default"
                        disabled={session.status === 'cancelled' || isPast(new Date(session.endTime))}
                        onClick={() => window.open(session.meetingLink, '_blank')}
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Join Session
                      </Button>
                    </div>
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
