"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

const questions = [
  "What's your current level of experience?",
  "How much time can you dedicate to learning?",
  "What are your main goals?"
]

export default function EditAssessmentPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [assessment, setAssessment] = useState<any>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentQuestion, setCurrentQuestion] = useState(0)

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const res = await fetch(`/api/student/assessments/${params.id}`)
        if (!res.ok) throw new Error('Failed to fetch assessment')
        const data = await res.json()
        setAssessment(data)
        // Pre-fill answers
        setAnswers(data.responses.reduce((acc: any, curr: any, idx: number) => {
          acc[idx] = curr.answer
          return acc
        }, {}))
      } catch (error) {
        toast.error("Failed to load assessment")
        router.push('/dashboard/student')
      } finally {
        setLoading(false)
      }
    }

    fetchAssessment()
  }, [params.id, router])

  const handleSubmit = async () => {
    try {
      const res = await fetch(`/api/student/assessments/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      })

      if (!res.ok) throw new Error('Failed to update assessment')
      
      toast.success('Assessment updated successfully')
      router.push('/dashboard/student')
    } catch (error) {
      toast.error('Failed to update assessment')
    }
  }

  if (loading) {
    return (
      <div className="container max-w-3xl mx-auto py-8 px-4">
        <Card className="p-8">
          <div className="text-center">Loading assessment...</div>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      <Card className="p-8">
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">Edit Assessment</h1>
            <p className="text-muted-foreground mt-2">
              Update your responses for {assessment?.subject.name}
            </p>
            <Badge variant="outline" className="mt-4">
              {assessment?.subject.area}
            </Badge>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="font-medium mb-4">{questions[currentQuestion]}</h2>
              <Select 
                value={answers[currentQuestion]}
                onValueChange={(value) => {
                  setAnswers(prev => ({ ...prev, [currentQuestion]: value }))
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your answer" />
                </SelectTrigger>
                <SelectContent>
                  {/* Same options as initial assessment */}
                  {currentQuestion === 0 && [
                    <SelectItem key="1" value="beginner">Complete Beginner</SelectItem>,
                    <SelectItem key="2" value="intermediate">Some Knowledge</SelectItem>,
                    <SelectItem key="3" value="advanced">Advanced</SelectItem>
                  ]}
                  {currentQuestion === 1 && [
                    <SelectItem key="1" value="minimal">5-10 minutes daily</SelectItem>,
                    <SelectItem key="2" value="moderate">30 minutes daily</SelectItem>,
                    <SelectItem key="3" value="dedicated">1 hour or more daily</SelectItem>
                  ]}
                  {currentQuestion === 2 && [
                    <SelectItem key="1" value="basics">Learn the Basics</SelectItem>,
                    <SelectItem key="2" value="fluent">Become Fluent</SelectItem>,
                    <SelectItem key="3" value="professional">Professional Development</SelectItem>
                  ]}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between gap-4">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>
              {currentQuestion < questions.length - 1 ? (
                <Button
                  onClick={() => setCurrentQuestion(prev => prev + 1)}
                  disabled={!answers[currentQuestion]}
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!Object.keys(answers).length}
                >
                  Update Assessment
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
