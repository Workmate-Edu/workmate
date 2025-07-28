"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressUpdateDialog } from "@/components/teacher/progress-update-dialog"
import { toast } from "sonner"
import { ArrowLeft, Trophy, Calendar, User, Clock, ClipboardCheck } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { format } from "date-fns"

interface Subject {
  name: string
  area: string
  progress: number
  isTeaching?: boolean
}

interface StudentRaw {
  id: string
  name: string
  email: string
  type: 'independent' | 'child'
  status: string
  gender: string
  grade?: string
  subjects: Subject[]
  latestProgress?: {
    understanding: number
    participation: number
    homework: number
  }
}

interface Course {
  _id: string
  name: string
  area: string
  isTeaching: boolean
}

interface StudentForDialog {
  id: string
  name: string
  courses: Course[]
}

interface Session {
  _id: string
  startTime: string
  endTime: string
  subject: {
    name: string
    area: string
  }
  status: 'scheduled' | 'completed' | 'cancelled'
  meetingLink: string
  duration: number
}

interface Progress {
  scores: {
    understanding: number
    participation: number
    homework: number
  }
  averageScore: number
  updatedAt: string
  subjectId: string
}

interface SubjectProgress {
  subjectId: string
  subjectName: string
  scores: {
    understanding: number
    participation: number
    homework: number
  }
  averageScore: number
  updatedAt: string
  progress: number // Add progress field
}

interface OverallProgress {
  percentage: number
  totalSubjects: number
  completedSubjects: number
  averageScore: number
}

export default function TeacherStudentDetailPage({ params }: { params: { studentId: string } }) {
  const [student, setStudent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showProgressDialog, setShowProgressDialog] = useState(false)
  const [latestProgress, setLatestProgress] = useState<Progress | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [loadingSessions, setLoadingSessions] = useState(true)
  const [studentProgress, setStudentProgress] = useState<Progress | null>(null)
  const [subjectProgresses, setSubjectProgresses] = useState<SubjectProgress[]>([])
  const [overallProgress, setOverallProgress] = useState<OverallProgress>({
    percentage: 0,
    totalSubjects: 0,
    completedSubjects: 0,
    averageScore: 0
  })
  const [availability, setAvailability] = useState<any>(null)
  const [availabilityLoading, setAvailabilityLoading] = useState(false)

  useEffect(() => {
    if (params.studentId) {
      fetchStudentDetails()
      fetchStudentSessions()
    }
  }, [params.studentId])

  const fetchStudentDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/teacher/students/${params.studentId}`)
      if (!response.ok) throw new Error('Failed to fetch student details')
      const data = await response.json()
      setStudent(data)
    } catch (error) {
      console.error('Error fetching student details:', error)
      toast.error("Failed to load student details")
    } finally {
      setLoading(false)
    }
  }

  const fetchStudentSessions = async () => {
    try {
      setLoadingSessions(true)
      const response = await fetch(`/api/teacher/students/${params.studentId}/sessions`)
      if (!response.ok) throw new Error('Failed to fetch sessions')
      const data = await response.json()
      setSessions(data)
    } catch (error) {
      console.error('Error fetching sessions:', error)
      toast.error("Failed to load sessions")
    } finally {
      setLoadingSessions(false)
    }
  }

  const fetchLatestProgress = async () => {
    try {
      const activeSubject = student?.subjects?.find(s => s.isTeaching)
      if (activeSubject) {
        const response = await fetch(
          `/api/teacher/students/${params.studentId}/progress?subjectId=${activeSubject._id}`
        )
        if (response.ok) {
          const data = await response.json()
          setLatestProgress(data.latestProgress)
        }
      }
    } catch (error) {
      console.error('Error fetching progress:', error)
    }
  }

  useEffect(() => {
    if (student) {
      fetchLatestProgress()
    }
  }, [student])

  useEffect(() => {
    if (student?.subjects?.length > 0) {
      fetchAllSubjectProgress()
    }
  }, [student])

  const calculateOverallProgress = (progresses: SubjectProgress[]) => {
    const total = progresses.length
    if (total === 0) return {
      percentage: 0,
      totalSubjects: 0,
      completedSubjects: 0,
      averageScore: 0
    }
  
    const completed = progresses.filter(p => 
      p.scores?.understanding > 0 || 
      p.scores?.participation > 0 || 
      p.scores?.homework > 0
    ).length
  
    // Calculate average of all non-zero progress percentages
    const validProgresses = progresses.filter(p => p.scores)
    const totalProgress = validProgresses.reduce((sum, p) => {
      const progress = calculateSubjectProgress(p.scores)
      return sum + progress
    }, 0)
  
    const averageProgress = validProgresses.length > 0 ? 
      totalProgress / validProgresses.length : 0
  
    return {
      percentage: averageProgress,
      totalSubjects: total,
      completedSubjects: completed,
      averageScore: validProgresses.reduce((sum, p) => sum + (p.averageScore || 0), 0) / total
    }
  }
  
  const calculateSubjectProgress = (scores: { understanding: number, participation: number, homework: number }) => {
    if (!scores) return 0
    const maxScore = 30 // 10 points max for each of 3 categories
    const totalScore = scores.understanding + scores.participation + scores.homework
    return (totalScore / maxScore) * 100
  }

  const fetchAllSubjectProgress = async () => {
    try {
      const subjects = student?.subjects?.filter(s => s.isTeaching) || []
      const progressPromises = subjects.map(async (subject) => {
        // Create the composite ID like in the database
        const subjectId = `${subject.area}-${subject.name}`.toLowerCase()
        
        const response = await fetch(
          `/api/teacher/students/${params.studentId}/progress?subjectId=${subjectId}`
        )
        
        if (response.ok) {
          const data = await response.json()
          if (data.latestProgress) {
            const scores = data.latestProgress.scores
            return {
              subjectId: subjectId, // Use the composite ID
              subjectName: subject.name,
              scores,
              averageScore: data.latestProgress.averageScore,
              updatedAt: data.latestProgress.updatedAt,
              progress: calculateSubjectProgress(scores)
            }
          }
        }
        
        // Default object if no progress found
        return {
          subjectId: subjectId,
          subjectName: subject.name,
          scores: {
            understanding: 0,
            participation: 0,
            homework: 0
          },
          averageScore: 0,
          updatedAt: null,
          progress: 0
        }
      })

      const results = await Promise.all(progressPromises)
      console.log("Fetched progress with IDs:", results)
      setSubjectProgresses(results)
      calculateOverallProgress(results)
    } catch (error) {
      console.error('Error fetching progress:', error)
    }
  }

  console.log("Subject progress", subjectProgresses)

  const handleProgressUpdate = () => {
    // Refetch all subject progress after update
    if (student?.subjects?.length > 0) {
      fetchAllSubjectProgress();
    }
  }

  const getSessionStatus = (session: Session) => {
    const now = new Date()
    const start = new Date(session.startTime)
    const end = new Date(session.endTime)
    if (now > end) return 'completed'
    if (now < start) return 'upcoming'
    return 'in-progress'
  }

  const filterSessions = (type: 'upcoming' | 'past') => {
    const now = new Date()
    return sessions.filter(session => {
      const start = new Date(session.startTime)
      return type === 'upcoming' ? start >= now : start < now
    })
  }

  const firstName = student?.name.split(" ")[0]

  // Fetch availability for this student (child)
  useEffect(() => {
    async function fetchAvailability() {
      setAvailabilityLoading(true)
      try {
        const res = await fetch(`/api/parent/children/${params.studentId}/availability`)
        if (res.ok) {
          setAvailability(await res.json())
        } else {
          setAvailability(null)
        }
      } catch {
        setAvailability(null)
      }
      setAvailabilityLoading(false)
    }
    fetchAvailability()
  }, [params.studentId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Card className="p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </Card>
      </div>
    )
  }

  if (!student) return <div className="container py-8">Student not found</div>

  const transformedStudent: StudentForDialog = {
    id: student.id,
    name: student.name,
    courses: student.subjects.map((s) => ({
      _id: `${s.area}-${s.name}`,
      name: s.name,
      area: s.area,
      isTeaching: s.isTeaching ?? false
    }))
  }

  return (
    <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Add Back Button at the top */}
      <div className="mb-4">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/teacher/students" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Students
          </Link>
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold">{firstName} Details</h1>
          <p className="text-sm sm:text-base text-muted-foreground">View and manage student progress</p>
        </div>
      </div>

      <Tabs defaultValue="details" className="mt-6">
        <TabsList
           className="
              flex justify-start items-center gap-2 whitespace-nowrap
              overflow-x-auto sm:overflow-x-visible 
              overflow-y-hidden 
              px-4 py-1 
              scroll-pl-4 scroll-pr-4 
              snap-x snap-mandatory
              "
               style={{ scrollbarWidth: "thin" }}

        >
          <TabsTrigger value="details" className="min-w-[120px] flex items-center justify-center">
            <User className="w-4 h-4 mr-2" />
            Details
          </TabsTrigger>
          <TabsTrigger value="sessions" className="min-w-[120px] flex items-center justify-center">
            <Calendar className="w-4 h-4 mr-2" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="progress" className="min-w-[120px] flex items-center justify-center">
            <Trophy className="w-4 h-4 mr-2" />
            Progress
          </TabsTrigger>
          <TabsTrigger value="assessments" className="min-w-[120px] flex items-center justify-center">
            <ClipboardCheck className="w-4 h-4 mr-2" />
            Assessments
          </TabsTrigger>
          <TabsTrigger value="availability" className="min-w-[120px] flex items-center justify-center">
            <Clock className="w-4 h-4 mr-2" />
            Availability
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details">
      
          <div className="mb-6">
            <h1 className="text-2xl font-bold">{firstName}</h1>
            <p className="text-muted-foreground">{student.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge>{student.type}</Badge>
              <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                {student.status}
              </Badge>
            </div>
          </div>

          <Tabs defaultValue="subjects" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="subjects">Subjects</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Student Information</h3>
                <div className="space-y-4">
                  <div>
                    <Label>Gender</Label>
                    <p className="font-medium capitalize">{student.gender}</p>
                  </div>
                  <div>
                    <Label>Grade</Label>
                    <p className="font-medium">{student.grade || 'Not specified'}</p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="subjects">
              <Card className="p-6">
                <div className="grid gap-4">
                  {student.subjects.filter(s => s.isTeaching).map((subject, index) => (
                    <div 
                      key={`${subject.area}-${subject.name}-${index}`} 
                      className="flex justify-between items-start p-4 border rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium capitalize">{subject.name}</h4>
                        <p className="text-sm text-muted-foreground capitalize">{subject.area}</p>
                      </div>
                      <Progress value={subject.progress} className="w-24" />
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Teaching Sessions</h2>
          </div>

          {loadingSessions ? (
            <Card>
              <CardContent className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </CardContent>
            </Card>
          ) : sessions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-40 space-y-4">
                <Calendar className="h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">No teaching sessions found</p>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="upcoming" className="space-y-4">
              <TabsList>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="past">Past</TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming">
                <div className="grid gap-4">
                  {filterSessions('upcoming').map((session) => (
                    <Card key={session._id}>
                      <CardContent className="p-6">
                        <div className="space-y-2">
                          <h4 className="font-medium capitalize">{session.subject.name}</h4>
                          <p className="text-sm">{format(new Date(session.startTime), 'PPP')}</p>
                          <p className="text-sm">
                            {format(new Date(session.startTime), 'p')} – {format(new Date(session.endTime), 'p')}
                          </p>
                          <Button asChild variant="outline" size="sm">
                            <a href={session.meetingLink} target="_blank" rel="noopener noreferrer">Join Class</a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="past">
                <div className="grid gap-4">
                  {filterSessions('past').map((session) => (
                    <Card key={session._id}>
                      <CardContent className="p-6">
                        <div className="space-y-2">
                          <h4 className="font-medium capitalize">{session.subject.name}</h4>
                          <p className="text-sm">{format(new Date(session.startTime), 'PPP')}</p>
                          <p className="text-sm">
                            {format(new Date(session.startTime), 'p')} – {format(new Date(session.endTime), 'p')}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
  {/* Header */}
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
    <h2 className="text-lg sm:text-2xl font-semibold">Progress Overview</h2>
    {/* <Button onClick={() => setShowProgressDialog(true)}>
      <Trophy className="mr-2 h-4 w-4" />
      Update Progress
    </Button> */}
  </div>

  {/* Summary Cards */}
  <Card className="p-4 sm:p-6 bg-muted text-xs sm:text-sm">
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {/* Overall Progress */}
      <div className="space-y-1">
        <Label className="text-xs sm:text-sm">Overall Progress</Label>
        <p className="text-xl sm:text-2xl font-bold">
          {overallProgress.percentage.toFixed(1)}%
        </p>
      </div>
      {/* Average Score */}
      <div className="space-y-1">
        <Label className="text-xs sm:text-sm">Average Score</Label>
        <p className="text-xl sm:text-2xl font-bold">
          {overallProgress.averageScore.toFixed(1)}/10
        </p>
      </div>
      {/* Subjects Completed */}
      <div className="space-y-1">
        <Label className="text-xs sm:text-sm">Subjects Completed</Label>
        <p className="text-xl sm:text-2xl font-bold">
          {overallProgress.completedSubjects}/{overallProgress.totalSubjects}
        </p>
      </div>
      {/* Progress Bar */}
      <div className="space-y-1">
        <Label className="text-xs sm:text-sm">Progress</Label>
        <Progress 
          value={overallProgress.percentage} 
          className="mt-2 h-2 sm:h-3" 
        />
      </div>
    </div>
  </Card>

  {/* Per‑Subject Cards */}
  <div className="space-y-4">
    {student?.subjects
      .filter((s) => s.isTeaching)
      .map((subject) => {
        const subjectId = `${subject.area}-${subject.name}`.toLowerCase()
        const prog = subjectProgresses.find((p) => p.subjectId === subjectId)
        const pct = prog?.scores
          ? calculateSubjectProgress(prog.scores).toFixed(1)
          : "0"
        return (
          <Card key={subjectId} className="p-4 sm:p-6 text-xs sm:text-sm">
            {/* Title Row */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
              <h3 className="text-base sm:text-lg font-semibold capitalize">{subject.name}</h3>
              <p className="mt-1 sm:mt-0 text-muted-foreground">
                Progress: {pct}%
              </p>
            </div>

            {/* Bar */}
            <Progress value={Number(pct)} className="mb-3 h-2 sm:h-3" />

            {/* Scores Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label className="text-xs sm:text-sm">Understanding</Label>
                <p className="text-lg sm:text-xl font-bold">
                  {prog?.scores?.understanding ?? "N/A"}/10
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs sm:text-sm">Participation</Label>
                <p className="text-lg sm:text-xl font-bold">
                  {prog?.scores?.participation ?? "N/A"}/10
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs sm:text-sm">Homework</Label>
                <p className="text-lg sm:text-xl font-bold">
                  {prog?.scores?.homework ?? "N/A"}/10
                </p>
              </div>
            </div>

            {/* Last Updated */}
            {prog?.updatedAt && (
              <p className="mt-3 text-xs text-muted-foreground">
                Last updated:{" "}
                {new Date(prog.updatedAt).toLocaleDateString()}
              </p>
            )}
          </Card>
        )
      })}
  </div>
</TabsContent>


       <TabsContent value="assessments">
  <div className="flex justify-between items-center mb-6">
    <h2 className="text-2xl font-semibold">Assessments</h2>
  </div>
  <Card>
    <CardHeader>
      <CardTitle>Student Assessments</CardTitle>
    </CardHeader>
    <CardContent>
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="submitted">Submitted</TabsTrigger>
          <TabsTrigger value="graded">Graded</TabsTrigger>
        </TabsList>

        {/* Pending Assessments */}
        <TabsContent value="pending" className="p-4">
          <p className="text-center text-muted-foreground py-6">
            No pending assessments
          </p>
        </TabsContent>

        {/* Submitted Assessments */}
        <TabsContent value="submitted" className="p-4">
          <p className="text-center text-muted-foreground py-6">
            No submitted assessments
          </p>
        </TabsContent>

        {/* Graded Assessments */}
        <TabsContent value="graded" className="p-4">
          <p className="text-center text-muted-foreground py-6">
            No graded assessments
          </p>
        </TabsContent>
      </Tabs>
    </CardContent>
  </Card>
</TabsContent>


        <TabsContent value="availability">
  <Card className="p-6">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg sm:text-xl font-semibold">Availability</h2>
    </div>

    {availabilityLoading ? (
      <p className="text-center text-sm text-muted-foreground">Loading...</p>
    ) : !availability ? (
      <p className="text-center text-sm text-muted-foreground">
        No availability set for this student.
      </p>
    ) : (
      <div className="space-y-4 text-xs sm:text-sm">
        {/* Meta info */}
        <div>
          <p>
            <span className="font-medium">Timezone:</span>{" "}
            {availability.timezone}
          </p>
          <p>
            <span className="font-medium">Valid:</span>{" "}
            {new Date(availability.validFrom).toLocaleDateString()} –{" "}
            {new Date(availability.validTo).toLocaleDateString()}
          </p>
        </div>

        {/* Table for sm+ */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full border rounded-lg bg-background shadow-sm">
            <thead>
              <tr>
                <th className="py-2 px-4 text-left bg-primary/10 text-primary">
                  Day
                </th>
                <th className="py-2 px-4 text-left bg-primary/10 text-primary">
                  Time Slots
                </th>
              </tr>
            </thead>
            <tbody>
              {availability.days.map((day: any) => (
                <tr
                  key={day.day}
                  className="border-b last:border-b-0 even:bg-muted/10"
                >
                  <td className="py-2 px-4 font-medium">{day.day}</td>
                  <td className="py-2 px-4">
                    <div className="flex flex-wrap gap-2">
                      {day.slots.length ? (
                        day.slots.map((slot: any, idx: number) => (
                          <span
                            key={idx}
                            className="inline-block bg-primary/5 px-2 py-1 rounded"
                          >
                            {(slot.startDisplay || slot.start)} –{" "}
                            {(slot.endDisplay || slot.end)}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted-foreground">No slots</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Card list for mobile */}
        <div className="space-y-2 sm:hidden">
          {availability.days.map((day: any) => (
            <div
              key={day.day}
              className="border rounded-lg p-3 bg-background shadow-sm"
            >
              <h4 className="font-medium mb-1">{day.day}</h4>
              {day.slots.length ? (
                <div className="flex flex-wrap gap-2">
                  {day.slots.map((slot: any, idx: number) => (
                    <span
                      key={idx}
                      className="inline-block bg-primary/5 px-2 py-1 rounded text-xs"
                    >
                      {(slot.startDisplay || slot.start)} –{" "}
                      {(slot.endDisplay || slot.end)}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No slots</p>
              )}
            </div>
          ))}
        </div>
      </div>
    )}
  </Card>
</TabsContent>

      </Tabs>

      <ProgressUpdateDialog
        open={showProgressDialog}
        onOpenChange={setShowProgressDialog}
        student={transformedStudent}
        onSuccess={() => {
          setShowProgressDialog(false)
          fetchStudentDetails()
          fetchLatestProgress()
          handleProgressUpdate()
        }}
      />
    </main>
  )
}
