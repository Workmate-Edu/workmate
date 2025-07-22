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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { getAllowedSubjectsForUser } from "@/lib/subscription-access"
import { Bar } from "react-chartjs-2"
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js"

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

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

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
  const [initialAssessment, setInitialAssessment] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)

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

  const calculateSubjectProgress = (subjects: any[]) => {
    if (!subjects?.length) return 0;
    
    // Get total progress from subjects array
    const totalProgress = subjects.reduce((sum, subject) => {
      return sum + (subject.progress || 0);
    }, 0);

    return subjects.length > 0 ? (totalProgress / subjects.length) : 0;
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get user profile with subjects and progress
        const profileRes = await fetch('/api/student/profile');
        const profileData = await profileRes.json();
        
        // Calculate overall progress from subjects
        const overallSubjectProgress = calculateSubjectProgress(profileData.studentProfile.subjects);
        
        // Get stats data
        const statsRes = await fetch('/api/student/dashboard/stats');
        const statsData = await statsRes.json();

        setStats(statsData);
        setOverallProgress({
          percentage: overallSubjectProgress, // Use subject progress
          totalSubjects: profileData.studentProfile.subjects?.length || 0,
          completedSubjects: profileData.studentProfile.subjects?.filter(
            (s: any) => s.progress > 0
          ).length || 0,
          averageScore: statsData.assessments?.averageScore || 0 // Keep assessment score
        });

      } catch (error) {
        console.error('Dashboard data error:', error);
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
      // Fetch user profile to get subjects and progress
      const response = await fetch('/api/student/profile')
      if (!response.ok) throw new Error('Failed to fetch profile')
      const data = await response.json()
      
      // Transform subjects data for display
      const progresses = data.studentProfile.subjects.map((subject: any) => ({
        subjectId: subject._id,
        subjectName: subject.name,
        area: subject.area,
        progress: subject.progress || 0,
        teacherName: 'Assigned Teacher' // You can fetch teacher name if needed
      }))

      // Calculate overall progress
      const totalProgress = progresses.reduce((sum, s) => sum + s.progress, 0)
      const averageProgress = progresses.length > 0 ? totalProgress / progresses.length : 0

      setSubjectProgresses(progresses)
      setOverallProgress({
        percentage: averageProgress,
        totalSubjects: progresses.length,
        completedSubjects: progresses.filter(p => p.progress > 0).length,
        averageScore: overallProgress.averageScore // Keep existing assessment score
      })

    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to load subjects')
    }
  }

  // inside your StudentDashboard component…

useEffect(() => {
  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // 1. fetch the “stats” payload
      const statsRes = await fetch("/api/student/dashboard/stats")
      const statsData = await statsRes.json()

      // 2. fetch the raw sessions
      const sessionsRes = await fetch("/api/student/sessions")
      const sessionsData: Array<{ startTime: string; endTime: string }> =
        await sessionsRes.json()

      // 3. compute total hours
      const totalHours = sessionsData.reduce((sum, s) => {
        const start = new Date(s.startTime)
        const end   = new Date(s.endTime)
        return sum + (end.getTime() - start.getTime()) / 1000 / 60 / 60
      }, 0)

      // 4. merge it into your stats state
      setStats({
        ...statsData,
        sessions: {
          ...statsData.sessions,
          totalHours: Math.round(totalHours)
        }
      })

      // …and whatever else you were doing
    } catch (err) {
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  fetchDashboardData()
}, [])


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

  useEffect(() => {
    const checkInitialAssessment = async () => {
      try {
        const res = await fetch('/api/student/initial-assessment')
        const data = await res.json()
        setInitialAssessment(data)
      } catch (error) {
        console.error('Error checking initial assessment:', error)
      } finally {
        setLoading(false)
      }
    }

    // Only check for independent students
    if (session?.user?.studentProfile?.registeredAs === 'independent') {
      checkInitialAssessment()
    } else {
      setLoading(false)
    }
  }, [session])

  useEffect(() => {
    // Fetch subscription
    fetch("/api/subscription/status")
      .then(res => res.json())
      .then(data => setSubscription(data.subscription))
      .catch(() => setSubscription(null))
  }, [])

  // Only show subjects the student/child is subscribed for
  // FIX: Support both independent students and children
  const [allowedSubjects, setAllowedSubjects] = useState<string[]>([]);

  useEffect(() => {
    async function fetchAllowedSubjects() {
      if (!session?.user?.id) {
        setAllowedSubjects([]);
        return;
      }
      // For independent students, childId is undefined or equals userId
      const result = await getAllowedSubjectsForUser({
        userId: session.user.id,
        childId: session.user.studentProfile?.registeredAs === "child"
          ? session.user.id
          : undefined
      });
      setAllowedSubjects(result);
    }
    fetchAllowedSubjects();
  }, [session?.user?.id, session?.user?.studentProfile?.registeredAs]);

  // Example: filter subjectProgresses
  const visibleSubjectProgresses = subjectProgresses.filter(
    s => allowedSubjects.includes(s.subjectName)
  )

  // Chart data for subject progress
  const chartLabels = visibleSubjectProgresses.map(s => s.subjectName)
  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Progress (%)",
        data: visibleSubjectProgresses.map(s => s.progress),
        backgroundColor: "#2563eb",
        borderRadius: 8,
        borderSkipped: false,
        barPercentage: 0.7,
        categoryPercentage: 0.7
      }
    ]
  }

  // --- FIX: If visibleSubjectProgresses is empty but subjects exist, fallback to studentProfile.subjects ---
  useEffect(() => {
    if (visibleSubjectProgresses.length === 0 && subjects.length === 0) {
      // Try to fetch from profileData if not already set
      fetch('/api/student/profile')
        .then(res => res.json())
        .then(data => {
          if (data?.studentProfile?.subjects?.length) {
            const fallbackProgresses = data.studentProfile.subjects.map((subject: any) => ({
              subjectId: subject._id,
              subjectName: subject.name,
              area: subject.area,
              progress: subject.progress || 0,
              teacherName: 'Assigned Teacher'
            }))
            setSubjectProgresses(fallbackProgresses)
          }
        })
        .catch(() => {})
    }
  }, [visibleSubjectProgresses.length, subjects.length])

  // Chart data for dashboard stats (not just subjects)
  const statsChartLabels = [
    "Teachers",
    "Assessments",
    "Assessments Completed",
    "Learning Hours",
    "Upcoming Sessions",
    "Completed Sessions"
  ]
  const statsChartData = {
    labels: statsChartLabels,
    datasets: [
      {
        label: "Dashboard Stats",
        data: [
          displayStats.teachers.total || 0,
          displayStats.assessments.total || 0,
          displayStats.assessments.completed || 0,
          displayStats.sessions.totalHours || 0,
          displayStats.sessions.upcoming || 0,
          displayStats.sessions.completed || 0
        ],
        backgroundColor: [
          "#2563eb", // Teachers
          "#facc15", // Assessments
          "#22c55e", // Assessments Completed
          "#a78bfa", // Learning Hours
          "#f472b6", // Upcoming
          "#f59e42"  // Completed
        ],
        borderRadius: 8,
        borderSkipped: false,
        barPercentage: 0.7,
        categoryPercentage: 0.7
      }
    ]
  }

  return (
    <div className="space-y-6">
      {!isChildStudent && assessments.length === 0 && (
        <div className="px-4 py-6">
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-100">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-yellow-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg text-yellow-800">Initial Assessment Required</h3>
                    <p className="text-yellow-700 mt-1">
                      Complete your initial assessment to help us personalize your learning experience and track your progress effectively.
                    </p>
                  </div>
                  <Button 
                    onClick={() => router.push('/dashboard/student/assessments/initial')}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white shadow-sm transition-all hover:shadow-md"
                  >
                    Start Assessment
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Header - More responsive */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3  mt-4">
        <h1 className="text-2xl font-bold">Welcome, {session?.user?.name}</h1>
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
  <p className="text-2xl font-bold mt-2">
    {stats?.sessions.totalHours ?? 0}h
  </p>
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
            <Label className="text-sm">Subject Progress</Label>
            <div className="text-2xl font-bold mt-1">
              {overallProgress.percentage.toFixed(1)}%
            </div>
          </div>
          <div>
            <Label className="text-sm">Assessment Score</Label>
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

      {/* Dashboard Stats Chart */}
      <Card className="p-4 md:p-6">
        <h2 className="text-lg font-semibold mb-4">Learning Overview</h2>
        <div className="w-full h-80">
          <Bar
            data={statsChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              layout: { padding: { top: 16, bottom: 16, left: 8, right: 8 } },
              plugins: {
                legend: { display: false },
                tooltip: {
                  backgroundColor: "#2563eb",
                  titleColor: "#fff",
                  bodyColor: "#fff",
                  borderColor: "#facc15",
                  borderWidth: 1,
                  padding: 10,
                  cornerRadius: 6,
                  displayColors: false
                }
              },
              scales: {
                x: {
                  grid: { display: false },
                  ticks: {
                    color: "#2563eb",
                    font: { size: 12, weight: "500" },
                    autoSkip: false,
                    maxRotation: 45,
                    minRotation: 0
                  }
                },
                y: {
                  beginAtZero: true,
                  grid: {
                    color: "#f1f5f9",
                    borderDash: [4, 4]
                  },
                  ticks: {
                    color: "#2563eb",
                    font: { size: 12, weight: "500" }
                  }
                }
              }
            }}
          />
        </div>
      </Card>

      {/* Subject Progress Chart */}
      <Card className="p-4 md:p-6">
        <h2 className="text-lg font-semibold mb-4">Subject Progress Overview</h2>
        {(visibleSubjectProgresses.length === 0 && subjectProgresses.length === 0) ? (
          <div className="text-muted-foreground">No subjects to display.</div>
        ) : (
          <div className="w-full h-80">
            <Bar
              data={{
                labels: (visibleSubjectProgresses.length > 0
                  ? visibleSubjectProgresses
                  : subjectProgresses
                ).map(s => s.subjectName),
                datasets: [
                  {
                    label: "Progress (%)",
                    data: (visibleSubjectProgresses.length > 0
                      ? visibleSubjectProgresses
                      : subjectProgresses
                    ).map(s => s.progress),
                    backgroundColor: "#2563eb",
                    borderRadius: 8,
                    borderSkipped: false,
                    barPercentage: 0.7,
                    categoryPercentage: 0.7
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                layout: { padding: { top: 16, bottom: 16, left: 8, right: 8 } },
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: "#2563eb",
                    titleColor: "#fff",
                    bodyColor: "#fff",
                    borderColor: "#facc15",
                    borderWidth: 1,
                    padding: 10,
                    cornerRadius: 6,
                    displayColors: false
                  }
                },
                scales: {
                  x: {
                    grid: { display: false },
                    ticks: {
                      color: "#2563eb",
                      font: { size: 12, weight: "500" },
                      autoSkip: true,
                      maxRotation: 45,
                      minRotation: 0
                    }
                  },
                  y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                      color: "#f1f5f9",
                      borderDash: [4, 4]
                    },
                    ticks: {
                      color: "#2563eb",
                      font: { size: 12, weight: "500" }
                    }
                  }
                }
              }}
            />
          </div>
        )}
      </Card>

      {/* Recent Activity & Upcoming - Stack on mobile, side by side on larger screens */}
      {/* <div className="grid gap-6 md:grid-cols-2">
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
      </div> */}

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
