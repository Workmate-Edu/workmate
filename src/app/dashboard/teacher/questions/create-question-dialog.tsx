"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { QuestionOptions } from "./question-options"
import type { QuestionType, SubjectArea, DifficultyLevel } from "@/types/questions"
import { FiLoader } from "react-icons/fi"

const questionFormSchema = z.object({
  subject: z.object({
    area: z.string().min(1, "Subject area is required"),
    name: z.string().min(1, "Subject name is required")
  }),
  level: z.string().min(1, "Level is required"),
  type: z.string().min(1, "Question type is required"),
  question: z.object({
    text: z.string().min(1, "Question text is required"),
    format: z.string().min(1, "Question format is required")
  }),
  options: z.array(z.object({
    text: z.string(),
    isCorrect: z.boolean(),
    explanation: z.string().optional()
  })).optional(),
  metadata: z.object({
    difficulty: z.string(),
    tags: z.array(z.string()),
    estimatedTime: z.number().min(1)
  })
})

const questionTypes = [
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "written", label: "Written" },
  { value: "true_false", label: "True/False" },
  { value: "initial_assessment", label: "Initial Assessment" }
] as const

type QuestionFormValues = z.infer<typeof questionFormSchema>

interface CreateQuestionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateQuestionDialog({ open, onOpenChange, onSuccess }: CreateQuestionDialogProps) {
  const [questionType, setQuestionType] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      subject: {
        area: "",
        name: ""
      },
      level: "",
      type: "",
      question: {
        text: "",
        format: ""
      },
      metadata: {
        difficulty: "medium",
        tags: [],
        estimatedTime: 5
      }
    }
  })

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = form.getValues()
      console.log('Form data:', formData)

      const questionData = {
        subject: {
          area: formData.subject.area,
          name: formData.subject.area
        },
        level: formData.level,
        type: "initial_assessment",
        question: {
          text: formData.question.text,
          format: questionType === "true_false" ? "true_false" : questionType
        },
        options: questionType === "true_false" 
          ? [{ isCorrect: Boolean(formData.options?.[0]?.isCorrect) }] 
          : formData.options || [],
        metadata: {
          difficulty: "medium",
          tags: [],
          estimatedTime: 5
        }
      }

      console.log('Sending to API:', questionData)

      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create question')
      }

      toast.success('Question created successfully')
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error('Question creation error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create question')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create New Question</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Subject Area</Label>
                <Select onValueChange={(value) => form.setValue("subject.area", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stem">STEM</SelectItem>
                    <SelectItem value="languages">Languages</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.subject?.area && (
                  <p className="text-sm text-red-500">{form.formState.errors.subject.area.message}</p>
                )}
              </div>

              <div>
                <Label>Level</Label>
                <Select onValueChange={(value) => form.setValue("level", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.level && (
                  <p className="text-sm text-red-500">{form.formState.errors.level.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label>Question Type</Label>
              <Select 
                onValueChange={(value) => {
                  setQuestionType(value)
                  form.setValue("type", value)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select question type" />
                </SelectTrigger>
                <SelectContent>
                  {questionTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.type && (
                <p className="text-sm text-red-500">{form.formState.errors.type.message}</p>
              )}
            </div>

            {questionType === "initial_assessment" && (
              <div className="space-y-4 border-l-2 border-primary/20 pl-4">
                <div>
                  <Label>Assessment Category</Label>
                  <Select onValueChange={(value) => form.setValue("assessmentCategory", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stem">STEM</SelectItem>
                      <SelectItem value="languages">Languages</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Skill Level Testing</Label>
                  <Select onValueChange={(value) => form.setValue("skillLevel", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="foundational">Foundational Skills</SelectItem>
                      <SelectItem value="intermediate">Intermediate Concepts</SelectItem>
                      <SelectItem value="advanced">Advanced Understanding</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Learning Objective</Label>
                  <Textarea 
                    placeholder="What specific skill or knowledge does this question assess?"
                    {...form.register("learningObjective")}
                  />
                </div>
              </div>
            )}

            <div>
              <Label>Question Text</Label>
              <Textarea 
                {...form.register("question.text")}
                placeholder="Enter your question here..."
                className="h-24"
              />
              {form.formState.errors.question?.text && (
                <p className="text-sm text-red-500">{form.formState.errors.question.text.message}</p>
              )}
            </div>

            {questionType && (
              <QuestionOptions 
                type={questionType} 
                onChange={(options) => form.setValue("options", options)}
              />
            )}

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <FiLoader className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Save Question'
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
