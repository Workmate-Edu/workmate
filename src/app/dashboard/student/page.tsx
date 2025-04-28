"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"  // Add this import

import { Calendar, Clock, 
  Users, GraduationCap, 
  MoreVertical, 
  Pencil, Trash2, 
  Star, BookCheck 
} from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { format } from "date-fns" // Add this import
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Subject {
  _id: string
  name: string
  area: string
  teacher: {
    name: string
    email: string
  }
  isTeaching: boolean
}

// Update subjects interface to match API response
interface SubjectWithProgress {
  _id: string
  name: string
  area: string
  scores: {
    understanding: number
    participation: number
    homework: number
  }
  averageScore: number
  updatedAt: string
  teacherId: string
}

interface Assessment {
  _id: string
  subject: {
    area: string
    name: string
  }
  status: string
  assignedTeacher?: {
    teacherId: string
    name: string
  }
  completedAt: string | Date // Update type to handle both string and Date
  responses: any[]
}

interface DashboardStats {
  teachers: {
    total: number
    list: Array<{
      id: string
      name: string
      email: string
      rating: number
      subjects: Array<{
        name: string
        area: string
        _id: string
      }>
    }>
  }
  assessments: {
    total: number
    completed: number
    recent: Array<{
      _id: string
      subject: {
        name: string
        area: string
      }
      status: string
    }>
  }
  sessions: {
    completed: number
    upcoming: number
    totalHours: number
    bySubject: Array<{
      subject: {
        name: string
        area: string
      }
      completed: number
      upcoming: number
      hours: number
    }>
  }
  subjects: Array<{
    name: string
    area: string
    progress: number
    teacher: {
      id: string
      name: string
      email: string
      rating: number
    } | null
  }>
}

interface UpcomingLesson {
  id: string
  subject: string
  teacherName: string
  date: string
  time: string
}

interface SubjectProgress {
  subjectId: string
  subjectName: string
  area: string
  teacherName: string
  scores: {
    understanding: number
    participation: number
    homework: number
  }
  averageScore: number
  updatedAt: string
}

interface OverallProgress {
  percentage: number
  totalSubjects: number
  completedSubjects: number
  averageScore: number
}

export default function StudentDashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)
  const [assessmentToDelete, setAssessmentToDelete] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [upcomingLessons, setUpcomingLessons] = useState<UpcomingLesson[]>([])
  const [subjects, setSubjects] = useState<SubjectWithProgress[]>([])
  const [subjectProgresses, setSubjectProgresses] = useState<SubjectProgress[]>([])
  const [overallProgress, setOverallProgress] = useState<OverallProgress>({
    percentage: 0,
    totalSubjects: 0,
    completedSubjects: 0,
    averageScore: 0
  })
  const [isChildStudent, setIsChildStudent] = useState(false)

  useEffect(() => {
    const checkStudentType = async () => {
      try {
        const res = await fetch('/api/student/profile')
        if (res.ok) {
          const profile = await res.json()
          setIsChildStudent(profile?.studentProfile?.registeredAs === 'child')
        }
      } catch (error) {
        console.error('Failed to check student type:', error)
      }
    }

    checkStudentType()
  }, [])

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const res = await fetch('/api/student/assessments')
        if (!res.ok) throw new Error('Failed to fetch assessments')
        const data = await res.json()
        setAssessments(data)
      } catch (error) {
        toast.error("Failed to load your assessments")
      } finally {
        setLoading(false)
      }
    }

    fetchAssessments()
  }, [])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const statsRes = await fetch('/api/student/dashboard/stats')
        
        if (!statsRes.ok) {
          throw new Error('Failed to fetch dashboard data')
        }
        
        const statsData = await statsRes.json()
        setStats(statsData)
        
      } catch (error) {
        console.error('Dashboard data error:', error)
        toast.error("Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, []) // Remove stats from dependency array

  useEffect(() => {
    fetchSubjectsAndProgress()
  }, [])

  const fetchSubjectsAndProgress = async () => {
    try {
      // Fetch subjects with progress data
      const response = await fetch('/api/student/subjects')
      if (!response.ok) throw new Error('Failed to fetch subjects')
      const data = await response.json()
      
      // Transform data for display
      const progresses = data.map(subject => ({
        subjectId: subject._id,
        subjectName: subject.name,
        area: subject.area,
        teacherName: subject.teacherId || 'Not Assigned',
        scores: subject.scores || {
          understanding: 0,
          participation: 0,
          homework: 0
        },
        averageScore: subject.averageScore || 0,
        updatedAt: subject.updatedAt
      }))

      setSubjects(data)
      setSubjectProgresses(progresses)
      setOverallProgress(calculateOverallProgress(progresses))

    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to load subjects')
    } finally {
      setLoading(false)
    }
  }

  const calculateSubjectProgress = (scores: { understanding: number, participation: number, homework: number }) => {
    if (!scores) return 0
    const maxScore = 30 // 10 points max for each of 3 categories
    const totalScore = scores.understanding + scores.participation + scores.homework
    return (totalScore / maxScore) * 100
  }

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

  // Update the stats display to handle null state
  const displayStats = stats || {
    teachers: { total: 0, list: [] },
    assessments: { total: 0, completed: 0, recent: [] },
    sessions: { completed: 0, upcoming: 0, totalHours: 0, bySubject: [] },
    subjects: []
  }

  console.log("Stats", stats)

  const canTakeNewAssessment = (subject: string) => {
    // Check if the subject already has an assessment
    return !assessments.some(a => 
      a.subject.name.toLowerCase() === subject.toLowerCase()
    )
  }

  const formatDate = (date: string | Date) => {
    try {
      return format(new Date(date), 'PPP')
    } catch {
      return 'Recently'
    }
  }

  const handleSubjectSelect = (subject: string, category: string) => {
    router.push(`/dashboard/student/assessments/initial?subject=${encodeURIComponent(subject)}&area=${encodeURIComponent(category)}`)
  }

  const handleDeleteAssessment = async (assessmentId: string) => {
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/student/assessments/${assessmentId}`, {
        method: 'DELETE'
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete assessment')
      }
      
      // Update assessments list by filtering out deleted one
      setAssessments(prev => prev.filter(a => a._id !== assessmentId))
      toast.success('Assessment deleted successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete assessment')
    } finally {
      setDeleteLoading(false)
      setAssessmentToDelete(null)
    }
  }

  // Update the Available Subjects card section
  const subjectsByArea = subjects.reduce((acc, subject) => {
    if (!acc[subject.area]) {
      acc[subject.area] = []
    }
    acc[subject.area].push(subject)
    return acc
  }, {} as Record<string, SubjectWithProgress[]>)

  return (
    <div className="space-y-6">
      {/* Header - More responsive */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Welcome, {session?.user?.name}</h1>
        <Button 
          onClick={() => router.push('/dashboard/student/messages')}
          variant="outline"
          className="w-full sm:w-auto"
        >
          View Messages
        </Button>
      </div>

      {/* Stats Grid - Better mobile layout */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="p-4 md:p-6">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-500" />
            <h3 className="font-medium">My Teachers</h3>
          </div>
          <p className="text-2xl font-bold mt-2">{displayStats.teachers.total}</p>
        </Card>

        <Card className="p-4 md:p-6">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-violet-500" />
            <h3 className="font-medium">Assessments</h3>
          </div>
          <p className="text-2xl font-bold mt-2">{displayStats.assessments.total}</p>
          <p className="text-sm text-muted-foreground">
            {displayStats.assessments.completed} completed
          </p>
        </Card>

        <Card className="p-4 md:p-6">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-green-500" />
            <h3 className="font-medium">Learning Hours</h3>
          </div>
          <p className="text-2xl font-bold mt-2">{displayStats.sessions.totalHours}h</p>
        </Card>

        <Card className="p-4 md:p-6">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-orange-500" />
            <h3 className="font-medium">Upcoming</h3>
          </div>
          <p className="text-2xl font-bold mt-2">{displayStats.sessions.upcoming}</p>
          <p className="text-sm text-muted-foreground">scheduled lessons</p>
        </Card>
      </div>

      {/* Progress Overview - Stack on mobile */}
      <Card className="p-4 md:p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label className="text-sm">Overall Progress</Label>
            <div className="text-2xl font-bold mt-1">
              {overallProgress.percentage.toFixed(1)}%
            </div>
          </div>
          <div>
            <Label className="text-sm">Average Score</Label>
            <div className="text-2xl font-bold mt-1">
              {overallProgress.averageScore.toFixed(1)}/10
            </div>
          </div>
          <div>
            <Label className="text-sm">Subjects Completed</Label>
            <div className="text-2xl font-bold mt-1">
              {overallProgress.completedSubjects}/{overallProgress.totalSubjects}
            </div>
          </div>
          <div>
            <Label className="text-sm">Progress</Label>
            <Progress 
              value={overallProgress.percentage} 
              className="mt-3"
            />
          </div>
        </div>
      </Card>

      {/* Subject Progress - Scrollable container */}
      <Card className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-lg font-semibold">Subject Progress</h2>
          <div className="mt-2 md:mt-0 w-full md:w-auto flex gap-2">
            {/* Add filter and sort controls here if needed */}
          </div>
        </div>
        <div className="max-h-[400px] overflow-y-auto -mx-4 px-4">
          {subjectProgresses.map((progress) => (
            <div key={progress.subjectId} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">{progress.subjectName}</h4>
                  <p className="text-sm text-muted-foreground">
                    {progress.area} • {progress.teacherName}
                  </p>
                </div>
                <div className="text-2xl font-bold">
                  {progress.averageScore ? `${progress.averageScore.toFixed(1)}` : '0'}
                </div>
              </div>
              <Progress 
                value={progress.averageScore * 10 || 0} 
                className="h-2"
              />
              {progress.updatedAt && (
                <p className="text-xs text-muted-foreground">
                  Last updated: {new Date(progress.updatedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
          {!loading && subjectProgresses.length === 0 && (
            <p className="text-muted-foreground text-center py-6">
              No subject progress available
            </p>
          )}
        </div>
      </Card>

      {/* Assessment Section - Better mobile spacing */}
      {!isChildStudent && (
        <Card className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-lg font-semibold">Your Assessments</h2>
            <Button 
              onClick={() => router.push('/dashboard/student/assessments/initial')}
              className="w-full sm:w-auto"
            >
              Take New Assessment
            </Button>
          </div>

          { !isChildStudent && assessments.length === 0 ? (
            <div className="text-center space-y-4">
              <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-medium">Start Your Learning Journey</h3>
              <p className="text-muted-foreground">
                Take your first assessment to get matched with the perfect teacher
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {assessments.map((assessment, index) => (
                <div key={index} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{assessment.subject.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {assessment.subject.area} • Completed {formatDate(assessment.completedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      {assessment.status === 'pending' ? (
                        <Badge variant="outline">Under Review</Badge>
                      ) : assessment.status === 'assigned' ? (
                        <div className="text-right">
                          <Badge variant="default">Teacher Assigned</Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            {assessment.assignedTeacher?.name}
                          </p>
                        </div>
                      ) : (
                        <Badge>Being Reviewed</Badge>
                      )}
                      {assessment.status === 'assigned' && (
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/student/learn/${assessment.subject.name.toLowerCase()}`)}
                        >
                          Start Learning
                        </Button>
                      )}
                      {assessment.status !== 'assigned' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => 
                              router.push(`/dashboard/student/assessments/edit/${assessment._id}`)
                            }>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit Assessment
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setAssessmentToDelete(assessment._id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Assessment
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Recent Activity & Upcoming - Stack on mobile, side by side on larger screens */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3 text-sm">
              <div className="p-2 bg-violet-50 rounded-full">
                <Star className="h-4 w-4 text-violet-500" />
              </div>
              <div>
                <p className="font-medium">Completed Initial Assessment</p>
                <p className="text-muted-foreground">Arabic • 2 days ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <div className="p-2 bg-green-50 rounded-full">
                <Users className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <p className="font-medium">Teacher Assigned</p>
                <p className="text-muted-foreground">Mathematics • 3 days ago</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Upcoming Lessons</h2>
          {upcomingLessons.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming lessons scheduled</p>
          ) : (
            <div className="space-y-4">
              {upcomingLessons.map(lesson => (
                <div key={lesson.id} className="flex items-start gap-3 text-sm">
                  <div className="p-2 bg-blue-50 rounded-full">
                    <BookCheck className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium">{lesson.subject}</p>
                    <p className="text-muted-foreground">
                      with {lesson.teacherName} • {lesson.date} at {lesson.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <AlertDialog 
        open={!!assessmentToDelete}
        onOpenChange={(open) => {
          if (!deleteLoading && !open) {
            setAssessmentToDelete(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your assessment. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => assessmentToDelete && handleDeleteAssessment(assessmentToDelete)}
              className="bg-destructive text-destructive-foreground"
              disabled={deleteLoading}
            >
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
