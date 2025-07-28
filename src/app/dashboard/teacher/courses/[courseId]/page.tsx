"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { 
  Users, 
  Calendar,
  ArrowLeft,
  GraduationCap, 
  Clock,
  RefreshCw,
  BarChart2
} from "lucide-react"
import Link from "next/link"
import { StartClassDialog } from "@/components/teacher/create-session-dialog"
import { UpdateProgressDialog } from "@/components/teacher/update-progress-dialog"
import { format, isPast } from "date-fns"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface CourseDetail {
  id: string
  name: string
  area: string
  students: Array<{
    id: string
    name: string
    grade?: string
    progress?: number
  }>
}

interface Session {
  _id: string
  status: string
  startTime: string
  endTime: string
  meetingLink: string
  timezone?: string
  studentId: {
    _id: string
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
    groupId?: string
  }
}

export default function CoursePage({ params }: { params: { courseId: string } }) {
  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [showStartClass, setShowStartClass] = useState(false)
  const [showUpdateProgress, setShowUpdateProgress] = useState(false)

  // EDIT FLOW:
  const [editSession, setEditSession] = useState<Session | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)

  const [subjectName] = useState(() => params.courseId.split('-')[1])

  const canEdit = (s: Session) =>
    (s.status === 'scheduled' || s.status === 'active') &&
    !isPast(new Date(s.startTime))

  const getStatusColor = (status: string, startTime: string) => {
    const past = isPast(new Date(startTime))
    if (past && status === 'scheduled') return 'bg-red-500'
    switch (status.toLowerCase()) {
      case 'scheduled': return 'bg-blue-500'
      case 'active':    return 'bg-green-500'
      case 'completed': return 'bg-gray-500'
      case 'cancelled': return 'bg-red-500'
      default:          return 'bg-gray-500'
    }
  }

  const getSessionStatus = (s: Session) => {
    const past = isPast(new Date(s.startTime))
    if (past && s.status === 'scheduled') return 'Past Due'
    return s.status.charAt(0).toUpperCase() + s.status.slice(1)
  }

 // in app/course/[courseId]/page.tsx

const formatRecurrenceInfo = (session: Session) => {
  if (!session.recurrence?.isRecurring) return null

  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const selectedDays = session.recurrence.daysOfWeek.map(d => days[d]).join(', ')
  const startDate = format(new Date(session.recurrence.startDate), 'PPP')
  const endDate   = format(new Date(session.recurrence.endDate),   'PPP')

  const start = new Date(session.recurrence.startDate)
  const end   = new Date(session.recurrence.endDate)
  const totalDays  = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  const totalWeeks = Math.ceil(totalDays / 7)

  let totalSessions
  switch (session.recurrence.pattern) {
    case 'daily':
      totalSessions = totalDays
      break
    case 'weekly':
      totalSessions = totalWeeks
      break
    case 'multiple-days':
      // new! multiply weeks × number of selected weekdays
      totalSessions = totalWeeks * session.recurrence.daysOfWeek.length
      break
    case 'twice-weekly':
      totalSessions = totalWeeks * session.recurrence.daysOfWeek.length
      break
    case 'bi-weekly':
      totalSessions = Math.ceil(totalWeeks / 2)
      break
    default:
      totalSessions = session.recurrence.totalSessions ?? 0
  }

  return `${session.recurrence.pattern} sessions on ${selectedDays}
Starts ${startDate} → ${endDate}
Total ${totalSessions} sessions`
}


  const fetchSessions = async () => {
    try {
      const res = await fetch(`/api/teacher/courses/${params.courseId}/sessions`)
      if (!res.ok) throw new Error(await res.text())
      setSessions(await res.json())
    } catch (err) {
      console.error(err)
      toast.error("Failed to load sessions")
    }
  }

  const fetchCourseData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/teacher/courses/${params.courseId}`)
      if (!res.ok) throw new Error('Course fetch failed')
      setCourse(await res.json())
      await fetchSessions()
    } catch (err) {
      console.error(err)
      toast.error("Failed to load course")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourseData()
  }, [params.courseId])

  const handleSessionCreated = () => fetchSessions()
  const handleProgressUpdate  = () => fetchCourseData()

  const handleEdit = (s: Session) => {
    setEditSession(s)
    setShowEditDialog(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center h-48 space-y-4">
        <p className="text-muted-foreground">Course not found</p>
        <Button variant="ghost" asChild>
          <Link href="/dashboard/teacher/courses">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Button variant="ghost" asChild className="mb-2">
            <Link href="/dashboard/teacher/courses" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Courses
            </Link>
          </Button>
          <h1 className="text-3xl font-bold capitalize">{course.name}</h1>
          <p className="text-muted-foreground">
            {course.area.charAt(0).toUpperCase() + course.area.slice(1)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowStartClass(true)} className="bg-primary text-primary-foreground">
            <Calendar className="mr-2 h-4 w-4" /> Create Session
          </Button>
          <Button variant="outline" onClick={() => setShowUpdateProgress(true)}>
            <BarChart2 className="mr-2 h-4 w-4" /> Update Progress
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Users className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-2xl font-bold">{course.students.length}</p>
            <p className="text-sm text-muted-foreground">Enrolled Students</p>
          </CardContent>
        </Card>
      </div>

      {/* Students */}
      <Card>
        <CardHeader><CardTitle>Enrolled Students</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {course.students.map(s => (
            <div key={s.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <GraduationCap className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{s.name}</p>
                  {s.grade && <p className="text-sm text-muted-foreground">Grade {s.grade}</p>}
                </div>
              </div>
              <div className="w-48">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Progress</span>
                  <span>{s.progress ?? 0}%</span>
                </div>
                <Progress 
                  value={s.progress ?? 0}
                  className={cn(
                    "h-2",
                    (s.progress ?? 0) >= 70 ? "bg-green-200" :
                    (s.progress ?? 0) >= 50 ? "bg-blue-200" :
                    "bg-yellow-200"
                  )}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Sessions */}
      <Card>
        <CardHeader><CardTitle>Scheduled Sessions</CardTitle></CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-6">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">No sessions scheduled</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.slice().reverse().map(s => (
                <Card key={s._id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(s.status, s.startTime)}>
                            {getSessionStatus(s)}
                          </Badge>
                          {s.recurrence?.isRecurring && (
                            <Badge variant="outline" className="flex items-center">
                              <RefreshCw className="mr-1 h-3 w-3" /> Recurring
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <Calendar className="mr-1 h-4 w-4" /> {format(new Date(s.startTime), 'PPP')}
                          <Clock    className="mr-1 h-4 w-4" /> {format(new Date(s.startTime), 'p')}
                        </div>
                        {s.recurrence?.isRecurring && (
                          <div className="mt-2 p-2 bg-muted/50 rounded text-sm">
                            {formatRecurrenceInfo(s)}
                          </div>
                        )}
                        <div className="mt-2 flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {s.studentId.name}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm" onClick={() => window.open(s.meetingLink, '_blank')}>
                          Join Session
                        </Button>
                        {canEdit(s) && (
                          <Button variant="outline" size="sm" onClick={() => handleEdit(s)}>
                            Edit
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      {course && (
        <>
          <StartClassDialog
            open={showStartClass}
            onOpenChange={setShowStartClass}
            courseId={params.courseId}
            courseName={course.name}
            students={course.students}
            onSuccess={handleSessionCreated}
          />

          <UpdateProgressDialog
            open={showUpdateProgress}
            onOpenChange={setShowUpdateProgress}
            students={course.students}
            subjectId={subjectName}
            onSuccess={handleProgressUpdate}
          />

          {editSession && (
            <StartClassDialog
              open={showEditDialog}
              onOpenChange={(open) => {
                setShowEditDialog(open)
                if (!open) setEditSession(null)
              }}
              courseId={params.courseId}
              courseName={course.name}
              students={course.students}
              initialData={{
                _id: editSession._id,
                dateTime: editSession.startTime.slice(0,16),
                duration: Math.round((new Date(editSession.endTime).getTime() - new Date(editSession.startTime).getTime())/60000).toString(),
                selectedStudents: [editSession.studentId._id],
                useCustomLink: !!editSession.meetingLink,
                externalLink: editSession.meetingLink,
                timezone: editSession.timezone,
                recurrence: editSession.recurrence
                  ? {
                      type: editSession.recurrence.pattern,
                      daysOfWeek: editSession.recurrence.daysOfWeek,
                      endsOn: editSession.recurrence.endDate.slice(0,10),
                      isRecurring: editSession.recurrence.isRecurring,
                    }
                  : { type: "none", daysOfWeek: [], endsOn: "", isRecurring: false }
              }}
              onSuccess={handleSessionCreated}
            />
          )}
        </>
      )}
    </div>
  )
}
