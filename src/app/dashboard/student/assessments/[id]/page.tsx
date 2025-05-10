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
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileViewerModal } from "@/components/file-viewer-modal"

export default function AssessmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [assessment, setAssessment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState<any>(null)

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const response = await fetch(`/api/assessments/${params.id}`)
        if (!response.ok) throw new Error('Failed to fetch assessment')
        const data = await response.json()
        console.log('Fetched assessment data:', data) // Debug log
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

  const renderAnswerAttachments = (answer: any) => {
    if (!answer?.attachments?.length) return null;
    
    return (
      <div className="mt-4 space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          Your Submitted Files ({answer.attachments.length}):
        </p>
        <div className="grid gap-2">
          {answer.attachments.map((attachment: any, idx: number) => (
            <div
              key={`${attachment.publicId || idx}`}
              onClick={() => setSelectedFile(attachment)}
              className="cursor-pointer hover:bg-accent/50 transition-colors rounded-lg"
            >
              <FileViewer
                file={{
                  name: attachment.name,
                  type: attachment.type,
                  size: attachment.size,
                  url: attachment.url
                }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

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

          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-6">
              {assessment.questions.map((question: any, index: number) => {
                const answer = assessment.submissions?.[0]?.answers?.find(
                  (a: any) => a.questionId === question.id
                );

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

                    {/* Answer Section */}
                    {answer ? (
                      <div className="mt-6 space-y-4 border-t pt-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Your Response</Badge>
                          {assessment.status === 'graded' && (
                            <Badge variant={answer.grade ? 'default' : 'destructive'}>
                              {answer.grade || 0} points
                            </Badge>
                          )}
                        </div>

                        {/* Text Answer */}
                        {answer.answer && (
                          <div className="bg-background border rounded-lg p-4">
                            <p className="whitespace-pre-wrap">{answer.answer}</p>
                          </div>
                        )}

                        {/* Render attachments using the new helper */}
                        {renderAnswerAttachments(answer)}
                      </div>
                    ) : (
                      <div className="mt-6">
                        <p className="text-sm text-muted-foreground">
                          No response submitted yet
                        </p>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </ScrollArea>

          {/* File viewer modal */}
          {selectedFile && (
            <FileViewerModal
              isOpen={!!selectedFile}
              onClose={() => setSelectedFile(null)}
              file={selectedFile}
            />
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
