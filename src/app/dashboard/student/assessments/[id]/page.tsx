"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Clock, AlertTriangle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"
import { format } from "date-fns"
import { FileViewer } from "@/components/file-viewer"

export default function AssessmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [assessment, setAssessment] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const response = await fetch(`/api/assessments/${params.id}`)
        if (!response.ok) throw new Error('Failed to fetch assessment')
        const data = await response.json()
        setAssessment(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load assessment",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAssessment()
  }, [params.id, toast])

  const canUpdate = () => {
    if (!assessment) return false
    if (assessment.status === 'graded') return false
    
    const dueDate = new Date(assessment.dueDate)
    const now = new Date()
    return now < dueDate
  }

  const handleStartEdit = () => {
    router.push(`/dashboard/student/assessments/${params.id}/edit`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (!assessment) {
    return <div>Assessment not found</div>
  }

  const isOverdue = new Date(assessment.dueDate) < new Date()

  return (
    <div className="container max-w-3xl mx-auto p-6">
      <Card className="p-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{assessment.title}</h1>
              <p className="text-muted-foreground mt-2">{assessment.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge>{assessment.type}</Badge>
              <Badge variant={assessment.status === 'graded' ? 'default' : 'secondary'}>
                {assessment.status}
              </Badge>
            </div>
          </div>

          {assessment.status === 'graded' && (
            <div className="bg-muted p-4 rounded-md">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Grade</h3>
                <span className="text-xl font-bold">
                  {assessment.grade || 0} / {assessment.totalPoints || assessment.questions.reduce((sum, q) => sum + (q.points || 0), 0)} points
                </span>
              </div>
              {assessment.feedback && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium">Teacher Feedback:</h4>
                  <p className="text-muted-foreground mt-1">{assessment.feedback}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Due: {format(new Date(assessment.dueDate), 'PPp')}</span>
            </div>
            {isOverdue && (
              <div className="flex items-center gap-1 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <span>Overdue</span>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {assessment.questions.map((question: any) => (
              <Card key={question.id} className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{question.question}</p>
                  <Badge>{question.type}</Badge>
                </div>

                {/* Add file viewer for questions with attachments */}
                {question.type === 'file' && question.attachment && (
                  <FileViewer file={question.attachment} />
                )}

                {/* Existing submission display */}
                {assessment.submissions?.[0]?.answers?.find(
                  (a: any) => a.questionId === question.id
                )?.answer && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">Your Answer:</p>
                    <p className="text-muted-foreground">
                      {assessment.submissions[0].answers.find(
                        (a: any) => a.questionId === question.id
                      ).answer}
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {assessment.submissions?.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Your Submission</h3>
              <div className="space-y-4">
                {assessment.submissions[0].answers.map((answer: any) => {
                  const question = assessment.questions.find(
                    (q: any) => q.id === answer.questionId
                  )
                  return (
                    <div key={answer.questionId} className="space-y-2">
                      <p className="font-medium">{question?.question}</p>
                      <p className="text-muted-foreground">{answer.answer}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => router.back()}>
              Back
            </Button>
            {canUpdate() && (
              <Button onClick={handleStartEdit}>
                Update Submission
              </Button>
            )}
          </div>

          {isOverdue && !assessment.submissions?.length && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-md flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              <p>This assessment is overdue and cannot be submitted.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
