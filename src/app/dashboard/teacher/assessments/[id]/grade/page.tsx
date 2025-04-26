"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"
import { Loader2, CheckCircle } from "lucide-react"

export default function GradeAssessmentPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [assessment, setAssessment] = useState<any>(null)
  const [grades, setGrades] = useState<Record<string, number>>({})
  const [feedback, setFeedback] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      }
    }

    fetchAssessment()
  }, [params.id, toast])

  const handleGradeSubmit = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/assessments/${params.id}/grade`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grades,
          feedback,
          status: 'graded'
        })
      })

      if (!response.ok) throw new Error('Failed to submit grades')

      toast({
        title: "Success",
        description: "Assessment graded successfully"
      })
      router.push('/dashboard/teacher/assessments')
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit grades",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!assessment) return <div>Loading...</div>

  const submission = assessment.submissions[0]
  if (!submission) return <div>No submission found</div>

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <Card className="p-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{assessment.title}</h1>
              <p className="text-muted-foreground mt-2">Grade Student Submission</p>
            </div>
            <Badge>{assessment.type}</Badge>
          </div>

          <Separator />

          <div className="space-y-6">
            {assessment.questions.map((question: any, index: number) => {
              const answer = submission.answers.find(
                (a: any) => a.questionId === question.id
              )

              return (
                <Card key={question.id} className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">Question {index + 1}</h3>
                        <p className="text-muted-foreground">
                          {question.points} points possible
                        </p>
                      </div>
                      <Badge>{question.type}</Badge>
                    </div>

                    <div className="space-y-2">
                      <p className="font-medium">{question.question}</p>
                      <div className="pl-4 border-l-2 space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Student Answer:
                        </p>
                        <p>{answer?.answer}</p>
                        {question.correctAnswer && (
                          <p className="text-sm text-green-600">
                            Correct Answer: {question.correctAnswer}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Points</label>
                      <Input
                        type="number"
                        min="0"
                        max={question.points}
                        value={grades[question.id] || ''}
                        onChange={(e) => 
                          setGrades(prev => ({
                            ...prev,
                            [question.id]: Number(e.target.value)
                          }))
                        }
                        className="w-24"
                      />
                    </div>
                  </div>
                </Card>
              )
            })}

            <div className="space-y-2">
              <label className="text-sm font-medium">Feedback</label>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Provide feedback to the student..."
                className="min-h-[100px]"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                onClick={handleGradeSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting Grades...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Submit Grades
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
