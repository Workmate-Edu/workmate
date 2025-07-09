"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import {
  Eye,
  EyeOff,
  UserCircle,
  BookOpen,
  ClipboardList,
  ArrowLeft,
  Key,
  LockIcon,
  FileIcon,
  Users,
  Calendar,
  Video,
  TrendingUp,
  BarChart4,
  Award
} from "lucide-react"
import { ParentAssessmentForm } from "@/components/forms/parent-assessment-form"
import { Progress } from "@/components/ui/progress"
import { TeacherProfileModal } from "@/components/teacher/teacher-profile-modal"

interface ChildDetails {
  id: string
  name: string
  username: string
  email: string
  grade: string
  gender: string
  subjects: Array<{
    name: string
    area: string
    progress: number
    teacher?: {
      id: string
      name: string
      email: string
    }
  }>
  allSubjects: Array<{
    name: string
    area: string
    progress: number
  }>
  activeCourses: Array<{
    name: string
    area: string
    progress: number
    teacher: {
      id: string
      name: string
      email: string
    }
  }>
}

interface Assessment {
  status: string
  submittedAt?: string
  responses?: Array<{
    category: string
    questions: Array<{
      question: string
      answer: string | string[]
    }>
  }>
}

interface DocumentInfo {
  id: string
  name: string
  description?: string
  url: string
  format: string
  uploadedAt: string
  subject: {
    id?: string
    name: string
    area: string
    _id?: string
  }
  teacher: string
}

interface SessionInfo {
  id: string
  teacher: {
    name: string
    email: string
  }
  subject: {
    name: string
    area: string
  }
  startTime: string
  endTime: string
  duration: number
  meetingLink: string
  status: string
}

interface SubjectProgress {
  name: string
  area: string
  progress: number
  averageScore?: number
  scores?: {
    understanding: number
    participation: number
    homework: number
  }
  lastUpdated?: string
  teacherName?: string
}

interface OverallProgress {
  percentage: number
  totalSubjects: number
  completedSubjects: number
  averageScore: number
}

interface TeacherQualification {
  degree: string;
  institution: string;
  year: string;
  _id?: string;
}

interface TeacherInfo {
  _id: string;
  name: string;
  bio?: string;
  teacherProfile?: {
    qualifications?: TeacherQualification[];
    subjects?: Array<{
      name: string;
      area: string;
    }>;
  };
}

export default function ChildDetailsPage({ params }: { params: { childId: string } }) {
  const [child, setChild] = useState<ChildDetails | null>(null)
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [loading, setLoading] = useState(true)
  const [assessmentLoading, setAssessmentLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [showCredentials, setShowCredentials] = useState(false)
  const [showEditAssessment, setShowEditAssessment] = useState(false)
  const [documents, setDocuments] = useState<DocumentInfo[]>([])
  const [sessions, setSessions] = useState<SessionInfo[]>([])
  const [progress, setProgress] = useState<SubjectProgress[]>([])
  const [progressLoading, setProgressLoading] = useState(false)
  const [sessionsLoading, setSessionsLoading] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null)
  const [showTeacherModal, setShowTeacherModal] = useState(false)

  const fetchChild = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/parent/children/${params.childId}`)
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to fetch child details")
      setChild(data.child)
    } catch (error) {
      console.error(error)
      toast.error("Failed to load child details")
    } finally {
      setLoading(false)
    }
  }

  const fetchAssessment = async () => {
    try {
      setAssessmentLoading(true)
      const response = await fetch(`/api/parent/children/${params.childId}/assessment`)
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to fetch assessment")
      console.log('Assessment data:', data) // Debug logging
      if (data.assessment) {
        setAssessment({
          status: data.assessment.status,
          responses: data.assessment.responses || [],
          submittedAt: data.assessment.createdAt
        })
      } else {
        setAssessment(null)
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to load assessment")
    } finally {
      setAssessmentLoading(false)
    }
  }

  const fetchProgress = async () => {
    try {
      setProgressLoading(true)
      const response = await fetch(`/api/parent/children/${params.childId}/progress`)
      if (!response.ok) throw new Error("Failed to fetch progress")
      const data = await response.json()
      setProgress(data)
    } catch (error) {
      console.error(error)
      toast.error("Failed to load progress data")
    } finally {
      setProgressLoading(false)
    }
  }

  // Update the fetchTeacherDetails function
  const fetchTeacherDetails = async (teacherId: string) => {
    try {
      const response = await fetch(`/api/teachers/${teacherId}`)
      if (!response.ok) throw new Error("Failed to fetch teacher details")
      const data = await response.json()
      setSelectedTeacher(data)
      setShowTeacherModal(true)
    } catch (error) {
      console.error('Error fetching teacher:', error)
      toast.error("Failed to load teacher details")
    }
  }

  useEffect(() => {
    async function fetchData() {
      try {
        await fetchChild()

        // Fetch documents
        const docsRes = await fetch(`/api/parent/children/${params.childId}/materials`)
        if (docsRes.ok) {
          const docsData = await docsRes.json()
          setDocuments(docsData)
        }

        // Fetch sessions
        setSessionsLoading(true)
        const sessionsRes = await fetch(`/api/parent/children/${params.childId}/sessions`)
        if (sessionsRes.ok) {
          const sessionsData = await sessionsRes.json()
          setSessions(sessionsData)
        }
      } catch (error) {
        console.error(error)
        toast.error("Failed to load data")
      } finally {
        setSessionsLoading(false)
      }
    }

    fetchData()
  }, [params.childId])

  useEffect(() => {
    if (activeTab === "assessment") {
      fetchAssessment()
    } else if (activeTab === "progress") {
      fetchProgress()
    }
  }, [activeTab])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!child) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Child not found</h1>
          <Button asChild>
            <Link href="/dashboard/parent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const renderAssessmentResponses = (responses: any[]) => {
    if (!responses?.length) {
      return (
        <div className="p-4 bg-muted/20 rounded-lg">
          <p className="text-center text-muted-foreground">No responses available</p>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {responses.map((section, index) => (
          <div key={index} className="bg-muted/20 p-6 rounded-lg">
            <h4 className="text-lg font-semibold text-primary mb-4 pb-2 border-b">
              {section.category}
            </h4>
            <div className="space-y-6">
              {section.questions?.map((q: any, qIndex: number) => (
                <div key={qIndex} className="bg-background p-4 rounded-lg border shadow-sm">
                  <div className="space-y-4">
                    <p className="font-medium text-primary">{q.question}</p>
                    <div className="bg-muted/50 p-4 rounded-md">
                      <p className="text-sm whitespace-pre-wrap">
                        {Array.isArray(q.answer) ? q.answer.join(', ') : q.answer}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderAssessmentStatus = (status: string) => {
    switch (status) {
      case 'assigned':
        return <Badge variant="success">Teacher Assigned</Badge>
      case 'pending':
        return <Badge variant="warning">Pending</Badge>
      default:
        return <Badge variant="secondary">Not Started</Badge>
    }
  }

  const canEditAssessment = (assessment: any) => {
    return assessment?.status === 'pending'
  }

  const renderAssessmentActions = () => {
    if (assessmentLoading) return null;

    if (!assessment) {
      return (
        <Button asChild>
          <Link href={`/dashboard/parent/children/${child?.id}/assessment`}>
            Start Assessment
          </Link>
        </Button>
      );
    }

    // Only show edit if assessment exists and is pending
    if (canEditAssessment(assessment)) {
      return (
        <Button 
          variant="outline" 
          onClick={() => setShowEditAssessment(true)}
        >
          Edit Assessment
        </Button>
      );
    }

    return null;
  };

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{child?.name}</h1>
        <p className="text-muted-foreground">Grade {child?.grade}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <UserCircle className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="subjects">
            <BookOpen className="w-4 h-4 mr-2" />
            Subjects
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileIcon className="w-4 h-4 mr-2" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="assessment">
            <ClipboardList className="w-4 h-4 mr-2" />
            Initial Assessment
          </TabsTrigger>
          <TabsTrigger value="schedule">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule
          </TabsTrigger>
          {/* <TabsTrigger value="progress">
            <TrendingUp className="w-4 h-4 mr-2" />
            Progress
          </TabsTrigger> */}
        </TabsList>

        <TabsContent value="overview">
          <Card className="p-6">
            <div className="space-y-6">
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Login Credentials</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCredentials(!showCredentials)}
                    className="gap-2"
                  >
                    {showCredentials ? (
                      <>
                        <EyeOff className="h-4 w-4" />
                        Hide Credentials
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4" />
                        Show Credentials
                      </>
                    )}
                  </Button>
                </div>
                {showCredentials ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-sm">Username</Label>
                      <div className="bg-background p-2 rounded border">
                        <code className="font-mono">{child?.username}</code>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-sm">Email</Label>
                      <div className="bg-background p-2 rounded border">
                        <code className="font-mono">{child?.email}</code>
                      </div>
                    </div>
                    <Button variant="default" className="w-full mt-4" asChild>
                      <Link href={`/dashboard/parent/children/${child?.id}/reset-password`}>
                        <Key className="h-4 w-4 mr-2" />
                        Change Password
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6 text-sm text-muted-foreground">
                    <LockIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p>Credentials are hidden for security.</p>
                    <p>Click "Show Credentials" to view.</p>
                  </div>
                )}
              </div>

              <div className="grid gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Gender</label>
                  <p className="font-medium">{child?.gender}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Grade</label>
                  <p className="font-medium">{child?.grade}</p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="subjects">
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All Subjects</TabsTrigger>
              <TabsTrigger value="active">Active Courses</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <Card className="p-6">
                <div className="grid gap-4">
                  {child?.allSubjects?.map(subject => (
                    <div
                      key={`${subject.area}-${subject.name}`}
                      className="flex justify-between items-center p-4 border rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium">{subject.name}</h4>
                        <p className="text-sm text-muted-foreground">{subject.area}</p>
                      </div>
                      <Badge variant="outline">
                        Progress: {subject.progress}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="active">
              <Card className="p-6">
                <div className="grid gap-4">
                  {child.activeCourses.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      No active courses available.
                    </div>
                  ): child?.activeCourses?.map(course => (
                    <div
                      key={`${course.area}-${course.name}`}
                      className="space-y-3 p-4 border rounded-lg"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{course.name}</h4>
                          <p className="text-sm text-muted-foreground">{course.area}</p>
                        </div>
                        <Badge variant="outline">
                          Progress: {course.progress}%
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{course.teacher.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {course.teacher.email}
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => fetchTeacherDetails(course.teacher.id)}
                        >
                          View Teacher
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="documents">
          <Card className="p-6">
            <div className="space-y-8">
              {/* General Documents */}
              {documents.filter(doc => doc.subject.name === 'General').length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="font-medium flex items-center gap-2">
                      <FileIcon className="h-4 w-4" />
                      General Documents
                    </h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {documents.find(d => d.subject.name === 'General')?.teacher}
                    </p>
                  </div>
                  <div className="grid gap-3">
                    {documents
                      .filter(doc => doc.subject.name === 'General')
                      .map(doc => (
                        <DocumentCard key={doc.id} document={doc} />
                      ))}
                  </div>
                </div>
              )}

              {/* Subject Documents */}
              {child?.activeCourses?.map(course => {
                const subjectDocs = documents.filter(doc => 
                  doc.subject.name.toLowerCase() === course.name.toLowerCase() &&
                  doc.subject.area.toLowerCase() === course.area.toLowerCase()
                )

                if (subjectDocs.length === 0) return null

                return (
                  <div key={`${course.area}-${course.name}`} className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-2">
                      <h3 className="font-medium flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        {course.name} - {course.area}
                      </h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {course.teacher.name}
                      </p>
                    </div>

                    <div className="grid gap-3">
                      {subjectDocs.map(doc => (
                        <DocumentCard key={doc.id} document={doc} />
                      ))}
                    </div>
                  </div>
                )
              })}

              {documents.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  No documents available yet.
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="assessment">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg">Assessment Status</h3>
                  {renderAssessmentStatus(assessment?.status)}
                  {assessment?.status === 'assigned' && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Assessment is locked - Teacher has been assigned
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  {renderAssessmentActions()}
                </div>
              </div>

              {assessmentLoading ? (
                <div className="flex justify-center items-center py-10">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                </div>
              ) : assessment?.responses ? (
                <ScrollArea className="h-[600px] rounded-md border p-4">
                  {renderAssessmentResponses(assessment.responses)}
                </ScrollArea>
              ) : null}
            </div>
          </Card>

          <Dialog open={showEditAssessment} onOpenChange={setShowEditAssessment}>
            <DialogContent className="max-w-4xl h-[90vh]">
              <DialogHeader>
                <DialogTitle>Edit Assessment - {child?.name}</DialogTitle>
              </DialogHeader>
              <ScrollArea className="flex-1 px-4">
                <ParentAssessmentForm
                  childId={params.childId}
                  initialData={assessment}
                  mode="edit"
                  onSuccess={async () => {
                    setShowEditAssessment(false)
                    await fetchAssessment()
                  }}
                />
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="schedule">
          <Card className="p-6">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Upcoming Sessions</h3>
              
              {sessionsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No scheduled sessions yet.
                </div>
              ) : (
                <div className="grid gap-4">
                  {sessions.map(session => (
                    <div 
                      key={session.id}
                      className="p-4 border rounded-lg space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">
                            {session.subject.name} - {session.subject.area}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            with {session.teacher.name}
                          </p>
                        </div>
                        <Badge variant={session.status === 'scheduled' ? 'default' : 'secondary'}>
                          {session.status}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <p className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(session.startTime).toLocaleDateString()}
                        </p>
                        <p className="text-muted-foreground">
                          {new Date(session.startTime).toLocaleTimeString()} - 
                          {new Date(session.endTime).toLocaleTimeString()}
                        </p>
                      </div>

                      {session.meetingLink && (
                        <Button 
                          variant="outline" 
                          className="w-full"
                          asChild
                        >
                          <a 
                            href={session.meetingLink} 
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Video className="h-4 w-4 mr-2" />
                            Join Meeting
                          </a>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="progress">
          <Card className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Learning Progress</h3>
                
                {/* Calculate overall progress */}
                <Card className="p-4">
                  <div className="flex items-center gap-4">
                    <TrendingUp className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Progress</p>
                      <p className="text-2xl font-bold">
                        {child?.studentProfile?.subjects?.length > 0
                          ? Math.round(
                              child.studentProfile.subjects.reduce(
                                (acc, subj) => acc + (subj.progress || 0), 
                                0
                              ) / child.studentProfile.subjects.length
                            )
                          : 0}%
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {progressLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : progress.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No progress data available yet.
                </div>
              ) : (
                <div className="space-y-6">
                  {progress.map((subject) => (
                    <div key={`${subject.area}-${subject.name}`} className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{subject.name}</h4>
                          <p className="text-sm text-muted-foreground">{subject.area}</p>
                          {subject.teacherName && (
                            <p className="text-sm text-muted-foreground">
                              Teacher: {subject.teacherName}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          {/* <p className="font-medium">{subject.progress}%</p> */}
                          {subject.averageScore && (
                            <p className="text-sm text-muted-foreground">
                              Score: {Math.round(subject.averageScore)}/10
                            </p>
                          )}
                        </div>
                      </div>

                      <Progress value={subject.progress} className="h-2" />

                      {subject.scores && (
                        <div className="grid grid-cols-3 gap-4 pt-2">
                          <div>
                            <p className="text-sm text-muted-foreground">Understanding</p>
                            <p className="font-medium">{Math.round(subject.scores.understanding)}/10</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Participation</p>
                            <p className="font-medium">{Math.round(subject.scores.participation)}/10</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Homework</p>
                            <p className="font-medium">{Math.round(subject.scores.homework)}/10</p>
                          </div>
                        </div>
                      )}

                      {subject.lastUpdated && (
                        <p className="text-xs text-muted-foreground">
                          Last updated: {new Date(subject.lastUpdated).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <TeacherProfileModal 
        open={showTeacherModal}
        onOpenChange={setShowTeacherModal}
        teacher={selectedTeacher}
      />
    </div>
  )
}

function DocumentCard({ document }: { document: DocumentInfo }) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50">
      <div className="flex items-center gap-3">
        <FileIcon className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">{document.name}</p>
          {document.description && (
            <p className="text-xs text-muted-foreground">
              {document.description}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Added: {new Date(document.uploadedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      <a
        href={document.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-primary hover:underline"
      >
        Download
      </a>
    </div>
  )
}
