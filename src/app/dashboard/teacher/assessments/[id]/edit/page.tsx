"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { QuestionForm } from "@/components/forms/question-form"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trash2, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const assessmentFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string(),
  dueDate: z.string(),
})

type AssessmentFormValues = z.infer<typeof assessmentFormSchema>

export default function EditAssessmentPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [questions, setQuestions] = useState<any[]>([])
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null)
  const [status, setStatus] = useState<'draft' | 'active'>('draft')

  const form = useForm<AssessmentFormValues>({
    resolver: zodResolver(assessmentFormSchema)
  })

  useEffect(() => {
    async function fetchAssessment() {
      try {
        const response = await fetch(`/api/assessments/${params.id}`)
        if (!response.ok) throw new Error("Failed to fetch assessment")
        const data = await response.json()
        
        // Populate form with existing data
        form.reset({
          title: data.title,
          description: data.description,
          dueDate: new Date(data.dueDate).toISOString().slice(0, 16)
        })
        setQuestions(data.questions)
        setStatus(data.status)
      } catch (error) {
        console.error("Error:", error)
        toast({
          title: "Error",
          description: "Failed to load assessment",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAssessment()
  }, [params.id, form, toast])

  const handleAddQuestion = (question: any) => {
    setQuestions([...questions, question])
    setEditingQuestion(null)
  }

  const handleRemoveQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id))
  }

  const onSubmit = async (formData: AssessmentFormValues) => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/assessments/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          questions,
          id: params.id,
          type: questions.some(q => q.type === 'file') 
            ? 'file_upload' 
            : questions.some(q => q.type === 'multiple_choice') 
              ? 'quiz' 
              : 'assignment'
        })
      })

      if (!response.ok) throw new Error("Failed to update assessment")

      toast({
        title: "Success",
        description: "Assessment updated successfully"
      })
      router.push(`/dashboard/teacher/assessments/${params.id}`)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "Failed to update assessment",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = async () => {
    setIsSaving(true)
    try {
      const formData = form.getValues()
      const response = await fetch(`/api/assessments/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          questions,
          id: params.id,
          status: 'active'  // Set status to active
        })
      })

      if (!response.ok) throw new Error("Failed to publish assessment")

      toast({
        title: "Success",
        description: "Assessment published successfully"
      })
      router.push(`/dashboard/teacher/assessments/${params.id}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to publish assessment",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="mt-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Edit Assessment</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          {status === 'draft' ? (
            <Button 
              onClick={handlePublish}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                'Publish Assessment'
              )}
            </Button>
          ) : (
            <Button 
              onClick={form.handleSubmit(onSubmit)}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Add status indicator */}
      <div className="flex items-center gap-2">
        <span className={`px-2 py-1 rounded-full text-sm ${
          status === 'draft' 
            ? 'bg-yellow-100 text-yellow-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {status === 'draft' ? 'Draft' : 'Active'}
        </span>
        {status === 'draft' && (
          <p className="text-sm text-muted-foreground">
            This assessment is in draft mode. Publish it to make it available to students.
          </p>
        )}
      </div>

      <Card className="p-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input {...form.register('title')} />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea {...form.register('description')} />
            </div>

            <div>
              <Label>Due Date</Label>
              <Input {...form.register('dueDate')} type="datetime-local" />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Questions</h2>
            
            {!editingQuestion && (
              <Button 
                type="button"
                onClick={() => setEditingQuestion('new')}
              >
                Add Question
              </Button>
            )}

            {editingQuestion === 'new' && (
              <Card className="p-4">
                <QuestionForm
                  onAddQuestion={handleAddQuestion}
                  onCancel={() => setEditingQuestion(null)}
                />
              </Card>
            )}

            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {questions.map((question) => (
                  <Card key={question.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge>{question.type}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {question.points} points
                          </span>
                        </div>
                        <p className="font-medium">{question.question}</p>
                        {question.type === 'multiple_choice' && (
                          <ul className="ml-4 space-y-1">
                            {question.options?.map((option: string, i: number) => (
                              <li key={i} className="text-sm">
                                {option === question.correctAnswer ? (
                                  <span className="text-green-600">✓ {option}</span>
                                ) : (
                                  option
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveQuestion(question.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </Card>

      <div className="sticky bottom-0 bg-background p-4 border-t flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        {status === 'draft' ? (
          <Button 
            onClick={handlePublish}
            disabled={isSaving}
          >
            {isSaving ? 'Publishing...' : 'Publish Assessment'}
          </Button>
        ) : (
          <Button 
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        )}
      </div>
    </div>
  )
}
