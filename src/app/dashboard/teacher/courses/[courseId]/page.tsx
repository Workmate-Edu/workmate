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
  Video,
  RefreshCw
} from "lucide-react"
import Link from "next/link"
import { StartClassDialog } from "@/components/teacher/start-class-dialog"
import { format, isPast } from "date-fns"

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

interface Student {
  id: string;
  name: string;
  email: string;
}

interface Session {
  _id: string;
  status: string;
  startTime: string;
  endTime: string;
  meetingLink: string;
  studentId: {  // This is the actual structure from the database
    _id: string;
    name: string;
    email: string;
  };
  recurrence?: {
    isRecurring: boolean;
    pattern: string;
    daysOfWeek: number[];
    startDate: string;
    endDate: string;
    totalSessions?: number;
  };
}

interface PageProps {
  params: {
    courseId: string
  }
}

// Add status color utility
const getStatusColor = (status: string, startTime: string) => {
  const isPastSession = isPast(new Date(startTime))
  
  if (isPastSession && status === 'scheduled') {
    return 'bg-red-500' // Past due sessions
  }

  switch (status.toLowerCase()) {
    case 'scheduled':
      return 'bg-blue-500'
    case 'active':
      return 'bg-green-500'
    case 'completed':
      return 'bg-gray-500'
    case 'cancelled':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
}

const getSessionStatus = (session: Session) => {
  const isPastSession = isPast(new Date(session.startTime))
  
  if (isPastSession && session.status === 'scheduled') {
    return 'Past Due'
  }

  return session.status.charAt(0).toUpperCase() + session.status.slice(1)
}

const formatRecurrenceInfo = (session: Session) => {
  if (!session.recurrence?.isRecurring) return null

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const selectedDays = session.recurrence.daysOfWeek.map(d => days[d]).join(', ')
  const startDate = format(new Date(session.recurrence.startDate), 'PPP')
  const endDate = format(new Date(session.recurrence.endDate), 'PPP')

  // Calculate total sessions based on pattern
  const start = new Date(session.recurrence.startDate)
  const end = new Date(session.recurrence.endDate)
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  const totalWeeks = Math.ceil(totalDays / 7)

  let totalSessions
  switch (session.recurrence.pattern) {
    case 'daily':
      totalSessions = totalDays
      break
    case 'weekly':
      totalSessions = totalWeeks
      break
    case 'twice-weekly':
      totalSessions = totalWeeks * session.recurrence.daysOfWeek.length
      break
    case 'bi-weekly':
      totalSessions = Math.ceil(totalWeeks / 2)
      break
    default:
      totalSessions = session.recurrence.totalSessions || "undefined"
  }

  return `${session.recurrence.pattern} sessions on ${selectedDays}\nStarts ${startDate} until ${endDate}\nTotal ${totalSessions} sessions`
}

export default function CoursePage({ params }: { params: { courseId: string } }) {
  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [showStartClass, setShowStartClass] = useState(false)

  const fetchSessions = async () => {
    try {
      const response = await fetch(`/api/teacher/courses/${params.courseId}/sessions`)
      if (!response.ok) throw new Error('Failed to fetch sessions')
      const data = await response.json()
      setSessions(data)
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
      toast.error("Failed to load sessions")
    }
  }

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true)
        // Fetch course details
        const courseRes = await fetch(`/api/teacher/courses/${params.courseId}`)
        if (!courseRes.ok) throw new Error('Failed to fetch course')
        const courseData = await courseRes.json()
        setCourse(courseData)
        
        // Fetch sessions
        await fetchSessions()
      } catch (error) {
        console.error(error)
        toast.error("Failed to load course data")
      } finally {
        setLoading(false)
      }
    }

    fetchCourseData()
  }, [params.courseId])

  const handleSessionCreated = () => {
    fetchSessions() // Refresh sessions
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
        <Button onClick={() => setShowStartClass(true)}>
          <Calendar className="mr-2 h-4 w-4" />
          Create Session
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Users className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-2xl font-bold">{course.students.length}</p>
            <p className="text-sm text-muted-foreground">Enrolled Students</p>
          </CardContent>
        </Card>

        {/* Add more stats cards as needed */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enrolled Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {course.students.map(student => (
              <div 
                key={student.id} 
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <GraduationCap className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{student.name}</p>
                    {student.grade && (
                      <p className="text-sm text-muted-foreground">
                        Grade {student.grade}
                      </p>
                    )}
                  </div>
                </div>
                {student.progress !== undefined && (
                  <Badge variant={student.progress >= 70 ? "success" : "default"}>
                    {student.progress}% Progress
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scheduled Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-6">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">No sessions scheduled</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <Card key={session._id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(session.status, session.startTime)}>
                            {getSessionStatus(session)}
                          </Badge>
                          {session.recurrence?.isRecurring && (
                            <Badge variant="outline" className="flex items-center">
                              <RefreshCw className="mr-1 h-3 w-3" />
                              Recurring
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-4 w-4" />
                            {format(new Date(session.startTime), 'PPP')}
                          </div>
                          <div className="flex items-center">
                            <Clock className="mr-1 h-4 w-4" />
                            {format(new Date(session.startTime), 'p')}
                          </div>
                        </div>

                        {session.recurrence?.isRecurring && (
                          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <RefreshCw className="h-4 w-4" />
                              <span className="font-medium">Recurring Session</span>
                            </div>
                            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                              <p>Pattern: {session.recurrence.pattern}</p>
                              <p>Days: {session.recurrence.daysOfWeek.map(d => 
                                ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]
                              ).join(', ')}</p>
                              <p>Until: {format(new Date(session.recurrence.endDate), 'PPP')}</p>
                              <p>Using same meeting link for all sessions</p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-start space-x-2 mt-4">
                          <Users className="h-4 w-4 mt-1 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">
                              Participant
                            </p>
                            <div className="space-y-1 mt-1">
                              <p className="text-sm text-muted-foreground">
                                {session.studentId?.name}
                              </p>
                            </div>
                          </div>
                        </div>

                        {session.recurrence?.isRecurring && (
                          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-2 text-sm">
                              <RefreshCw className="h-3 w-3" />
                              <span className="font-medium">Recurring Session</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {formatRecurrenceInfo(session)}
                            </p>
                            {session.recurrence.groupId && (
                              <p className="text-xs text-muted-foreground mt-2">
                                Part of recurring sessions series
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(session.meetingLink, '_blank')}
                      >
                        Join Session
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {course && (
        <StartClassDialog // Consider renaming this component in future
          open={showStartClass}
          onOpenChange={setShowStartClass}
          courseId={params.courseId}
          courseName={course.name}
          students={course.students || []}
          onSuccess={handleSessionCreated}
        />
      )}
    </div>
  )
}
