"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function EditSubmissionPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [assessment, setAssessment] = useState<any>(null)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const response = await fetch(`/api/assessments/${params.id}`)
        if (!response.ok) throw new Error('Failed to fetch assessment')
        const data = await response.json()
        setAssessment(data)
        
        // Pre-populate answers from previous submission
        if (data.submissions?.[0]?.answers) {
          const existingAnswers = data.submissions[0].answers.reduce(
            (acc: any, curr: any) => ({
              ...acc,
              [curr.questionId]: curr.answer
            }),
            {}
          )
          setAnswers(existingAnswers)
        }
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

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/assessments/${params.id}/submit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: Object.entries(answers).map(([questionId, answer]) => ({
            questionId,
            answer
          }))
        })
      })

      if (!response.ok) throw new Error('Failed to update submission')

      toast({
        title: "Success",
        description: "Assessment updated successfully"
      })
      
      // Redirect to assessments list instead of detail page
      router.push('/dashboard/student/assessments')
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update assessment",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!assessment) {
    return <div>Loading...</div>
  }

  return (
    <div className="container max-w-3xl mx-auto p-6">
      <Card className="p-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Update Submission</h1>
            <p className="text-muted-foreground mt-2">{assessment.title}</p>
          </div>

          <div className="space-y-6">
            {assessment.questions.map((question: any) => (
              <Card key={question.id} className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{question.question}</p>
                    <Badge>{question.type}</Badge>
                  </div>

                  <Input
                    value={answers[question.id] || ''}
                    onChange={(e) => 
                      setAnswers(prev => ({
                        ...prev,
                        [question.id]: e.target.value
                      }))
                    }
                    placeholder="Your answer"
                  />
                </div>
              </Card>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Submission'
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
