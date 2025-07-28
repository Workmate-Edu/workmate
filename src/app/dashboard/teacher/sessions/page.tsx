"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Video, BookOpen, User, RefreshCw, CheckCircle } from "lucide-react"
import { format, isPast } from "date-fns"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { formatAssessmentDateTime } from "@/lib/timezone-utils"
import { StartClassDialog } from "@/components/teacher/create-session-dialog"

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
  status: 'scheduled' | 'active' | 'completed' | 'cancelled' | 'teacher-completed'
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
  const [marking, setMarking] = useState<string | null>(null)
  const [editSession, setEditSession] = useState<TeacherSession | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)

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

  const handleMarkComplete = async (sessionId: string) => {
    setMarking(sessionId)
    try {
      const res = await fetch(`/api/teacher/sessions/${sessionId}/complete`, {
        method: "POST"
      })
      if (res.ok) {
        setSessions(prev =>
          prev.map(s =>
            s._id === sessionId ? { ...s, status: "teacher-completed" } : s
          )
        )
        toast.success("Session marked as complete. Awaiting admin confirmation.")
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to mark as complete")
      }
    } catch (err) {
      toast.error("Failed to mark as complete")
    } finally {
      setMarking(null)
    }
  }

  const formatRecurrenceInfo = (session: TeacherSession) => {
    if (!session.recurrence?.isRecurring) return null
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const selectedDays = session.recurrence.daysOfWeek.map(d => days[d]).join(', ')
    const endDate = format(new Date(session.recurrence.endDate), 'PPP')
    return `${session.recurrence.pattern} sessions on ${selectedDays} until ${endDate}`
  }

  // Handler to open edit dialog with session data
  const handleEditSession = (session: TeacherSession) => {
    setEditSession(session)
    setShowEditDialog(true)
  }

  // Handler for updating session (after edit)
  const handleEditSuccess = () => {
    setShowEditDialog(false)
    setEditSession(null)
    fetchSessions()
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
          sessions.slice().reverse().map((session) => {
            const { teacherTime, studentTime } = formatAssessmentDateTime({
              dateStr: session.startTime,
              teacherTimezone: session.timezone || 'Africa/Lagos'
            })

            const canMarkComplete =
              (session.status === "scheduled" || session.status === "active") &&
              isPast(new Date(session.endTime))

            const canEdit =
              (session.status === "scheduled" || session.status === "active") &&
              !isPast(new Date(session.endTime))

            return (
              <Card key={session._id}>
                <CardContent className="p-4 md:p-6">
                  <div className="flex-1 space-y-4">
                    {/* Subject & Status */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 flex-shrink-0" />
                        <span className="font-medium capitalize">
                          {session.subject.name}
                          <span className="text-sm text-muted-foreground ml-1 capitalize">
                            ({session.subject.area})
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={cn(
                          "whitespace-nowrap",
                          session.status === 'cancelled' ? "bg-red-500" :
                          session.status === 'teacher-completed' ? "bg-yellow-500" :
                          session.status === 'completed' ? "bg-green-500" :
                          isPast(new Date(session.startTime)) ? "bg-gray-500" :
                          "bg-green-500"
                        )}>
                          {session.status.replace("-", " ")}
                        </Badge>
                        {session.recurrence?.isRecurring && (
                          <Badge variant="outline" className="flex items-center">
                            <RefreshCw className="mr-1 h-3 w-3" />
                            Recurring
                          </Badge>
                        )}
                        {canEdit && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="ml-2"
                            onClick={() => handleEditSession(session)}
                          >
                            Edit
                          </Button>
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
                        <div className="text-xs text-blue-600 capitalize">
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

                      {/* Mark as Complete Button */}
                      {canMarkComplete && (
                        <Button
                          className="w-full mt-2 bg-yellow-600 hover:bg-yellow-700 text-white"
                          disabled={marking === session._id}
                          onClick={() => handleMarkComplete(session._id)}
                        >
                          {marking === session._id ? "Marking..." : "Mark as Complete"}
                        </Button>
                      )}

                      {/* Status Info */}
                      {session.status === "teacher-completed" && (
                        <div className="flex items-center gap-2 text-yellow-700 mt-2">
                          <CheckCircle className="h-4 w-4" />
                          Awaiting admin confirmation
                        </div>
                      )}
                      {session.status === "completed" && (
                        <div className="flex items-center gap-2 text-green-700 mt-2">
                          <CheckCircle className="h-4 w-4" />
                          Completed
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
      {/* Edit Session Dialog */}
      {editSession && (
        <StartClassDialog
          open={showEditDialog}
          onOpenChange={(open) => {
            setShowEditDialog(open)
            if (!open) setEditSession(null)
          }}
          courseId={`${editSession.subject.name}`}
          courseName={editSession.subject.name}
          students={[{ id: editSession.student.id, name: editSession.student.name }]}
          onSuccess={handleEditSuccess}
          initialData={{
            _id: editSession._id, // <-- ensure this is passed for PATCH
            dateTime: editSession.startTime.slice(0, 16),
            duration: editSession.duration.toString(),
            selectedStudents: [editSession.student.id],
            externalLink: editSession.meetingLink,
            useCustomLink: !!editSession.meetingLink,
            timezone: editSession.timezone,
            recurrence: editSession.recurrence
              ? {
                  type: editSession.recurrence.pattern || "none",
                  daysOfWeek: editSession.recurrence.daysOfWeek || [],
                  endsOn: editSession.recurrence.endDate
                    ? new Date(editSession.recurrence.endDate).toISOString().slice(0, 10)
                    : "",
                  isRecurring: !!editSession.recurrence.isRecurring,
                }
              : {
                  type: "none",
                  daysOfWeek: [],
                  endsOn: "",
                  isRecurring: false,
                },
          }}
        />
      )}
    </div>
  )
}
