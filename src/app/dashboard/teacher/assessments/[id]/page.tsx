"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  FiClock, FiUser, FiFile, FiEdit3, 
  FiTrash2, FiDownload, FiCheck
} from "react-icons/fi"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, Loader2, FileIcon } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { FileViewerModal } from "@/components/file-viewer-modal"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileViewer } from "@/components/file-viewer"

type Submission = {
  studentId: string
  submittedAt: string
  grade?: number
  status: 'submitted' | 'graded' | 'returned'
  studentName: string
  attachments?: string[]
}

type Question = {
  id: string
  type: "multiple_choice" | "text" | "file"
  question: string
  options?: string[]
  points: number
  attachment?: {
    name: string
    type: string
    url: string
  }
}

type Assessment = {
  _id: string
  title: string
  description: string
  type: "quiz" | "assignment" | "file_upload"
  subject: string
  dueDate: string
  status: "draft" | "active" | "completed"
  submissions: Submission[]
  points: number
  createdAt: string
  updatedAt: string
  questions: Question[]
  studentId: string
  teacherId: string
}

export default function TeacherAssessmentPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<any>(null)

  useEffect(() => {
    async function fetchAssessment() {
      try {
        const response = await fetch(`/api/assessments/${params.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch assessment")
        }
        const data = await response.json()
        setAssessment(data)
      } catch (error) {
        console.error("Error fetching assessment:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchAssessment()
    }
  }, [params.id])

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/assessments/${params.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error("Failed to delete assessment")

      toast({
        title: "Success",
        description: "Assessment deleted successfully"
      })
      router.push('/dashboard/teacher/assessments')
    } catch (error) {
      console.error("Delete error:", error)
      toast({
        title: "Error",
        description: "Failed to delete assessment",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleGrade = () => {
    router.push(`/dashboard/teacher/assessments/${params.id}/grade`)
  }

  if (isLoading) {
    return (
      <div className="mt-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
        <div className="grid gap-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  if (!assessment) {
    return (
      <div className="mt-6 flex flex-col items-center justify-center h-[50vh]">
        <h2 className="text-2xl font-bold mb-2">Assessment Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The assessment you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  const submissionStats = {
    total: assessment.submissions.length,
    graded: assessment.submissions.filter(s => s.status === 'graded').length,
    pending: assessment.submissions.filter(s => s.status === 'submitted').length,
    average: assessment.submissions
      .filter(s => s.grade !== undefined)
      .reduce((acc, curr) => acc + (curr.grade || 0), 0) / assessment.submissions.length || 0
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800'
      case 'graded':
        return 'bg-green-100 text-green-800'
      case 'returned':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const hasSubmission = assessment?.submissions?.some(
    s => s.studentId === assessment.studentId
  )

  const getAssessmentStatus = () => {
    if (assessment?.status === 'draft') return {
      label: 'Draft',
      color: 'bg-yellow-100 text-yellow-800'
    }
    if (hasSubmission) return {
      label: 'Completed',
      color: 'bg-green-100 text-green-800'
    }
    return {
      label: 'Active',
      color: 'bg-blue-100 text-blue-800'
    }
  }

  return (
    <div className="mt-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Button 
            variant="ghost" 
            className="mb-2"
            onClick={() => router.push('/dashboard/teacher/assessments')}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Assessments
          </Button>
          <h1 className="text-3xl font-bold">{assessment.title}</h1>
          <p className="text-muted-foreground">
            {assessment.subject} • {assessment.type.replace('_', ' ')}
          </p>
        </div>
        <div className="flex gap-2">
          {assessment?.status === 'submitted' && (
            <Button onClick={handleGrade} className="gap-2">
              <FiCheck className="w-4 h-4" />
              Grade Assessment
            </Button>
          )}
          <Button variant="outline" onClick={() => router.push(`/dashboard/teacher/assessments/${assessment._id}/edit`)}>
            <FiEdit3 className="w-4 h-4 mr-2" /> Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <FiTrash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Assessment</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this assessment? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          icon={<FiUser className="w-6 h-6" />}
          label="Total Submissions"
          value={assessment.submissions.length}
        />
        <StatsCard
          icon={<FiCheck className="w-6 h-6 text-green-600" />}
          label="Graded"
          value={assessment.submissions.filter(s => s.status === 'graded').length}
          bgColor="bg-green-100"
        />
        <StatsCard
          icon={<FiClock className="w-6 h-6 text-yellow-600" />}
          label="Pending Review"
          value={assessment.submissions.filter(s => s.status === 'submitted').length}
          bgColor="bg-yellow-100"
        />
        <StatsCard
          icon={<FiFile className="w-6 h-6 text-blue-600" />}
          label="Average Grade"
          value={`${Math.round(submissionStats.average)}%`}
          bgColor="bg-blue-100"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Assessment Details */}
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Assessment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <p className="font-medium capitalize">{assessment.type.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Due Date</p>
              <p className="font-medium">{new Date(assessment.dueDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Points</p>
              <p className="font-medium">{assessment.points}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className={`inline-flex px-2 py-1 rounded-full text-sm capitalize ${getAssessmentStatus().color}`}>
                {getAssessmentStatus().label}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="text-sm">{assessment.description}</p>
            </div>
          </CardContent>
        </Card>

        {/* Questions Section */}
        <Card className="md:col-span-8">
          <CardHeader>
            <CardTitle>Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-6">
                {assessment.questions.map((question, index) => {
                  const submission = assessment.submissions?.[0]
                  const answer = submission?.answers?.find(
                    (a: any) => a.questionId === question.id
                  )

                  return (
                    <Card key={question.id} className="p-6">
                      {/* Question Section */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">Question {index + 1}</Badge>
                            <Badge>{question.type}</Badge>
                          </div>
                          <Badge variant="secondary">{question.points} points</Badge>
                        </div>

                        <div className="bg-muted/50 p-4 rounded-lg space-y-4">
                          <p className="font-medium">{question.question}</p>

                          {/* Question Attachment */}
                          {question.attachment && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-muted-foreground mb-2">
                                Question Material:
                              </p>
                              <div
                                onClick={() => setSelectedFile(question.attachment)}
                                className="cursor-pointer hover:bg-accent/50 transition-colors"
                              >
                                <FileViewer file={question.attachment} />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Student's Answer Section */}
                      {answer && (
                        <div className="mt-6 space-y-4 border-t pt-4">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">Student's Response</Badge>
                            {answer.grade !== undefined && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Grade:</span>
                                <Badge>{answer.grade || 0} / {question.points}</Badge>
                              </div>
                            )}
                          </div>

                          {/* Text Answer */}
                          {answer.answer && (
                            <div className="bg-background border rounded-lg p-4">
                              <p className="whitespace-pre-wrap">{answer.answer}</p>
                            </div>
                          )}

                          {/* Attachments */}
                          {answer.attachments?.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-muted-foreground">
                                Attachments ({answer.attachments.length}):
                              </p>
                              <div className="grid gap-2">
                                {answer.attachments.map((attachment: any, idx: number) => (
                                  <div
                                    key={`${attachment.publicId || idx}`}
                                    onClick={() => setSelectedFile(attachment)}
                                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                                  >
                                    <FileViewer
                                      file={{
                                        name: attachment.name,
                                        type: attachment.type,
                                        url: attachment.url,
                                        size: attachment.size
                                      }}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  )
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* File Viewer Modal */}
        {selectedFile && (
          <FileViewerModal
            isOpen={!!selectedFile}
            onClose={() => setSelectedFile(null)}
            file={selectedFile}
          />
        )}
      </div>
    </div>
  )
}

// Stats Card Component
function StatsCard({ icon, label, value, bgColor = "bg-primary/10" }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`p-3 ${bgColor} rounded-full`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
        </div>
      </CardContent>
    </Card>
  )
}