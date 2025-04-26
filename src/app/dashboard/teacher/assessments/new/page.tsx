"use client"

import React from "react"
import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
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
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { QuestionForm } from "@/components/forms/question-form"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Edit, Trash2, Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"

interface Student {
  id: string
  name: string
  email?: string
  assignedSubjects: Array<{
    name: string
    area: string
    _id: string
  }>
}

interface Props {}

// Add assessment form schema
const assessmentFormSchema = z.object({
  studentId: z.string(),
  subject: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string(),
  dueDate: z.string(),
})

type AssessmentFormValues = z.infer<typeof assessmentFormSchema>

const Page: React.FC<Props> = () => {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState<string>("")
  const [selectedSubject, setSelectedSubject] = useState<string>("")
  const [step, setStep] = useState<'details' | 'questions'>('details')
  const [questions, setQuestions] = useState<Assessment['questions']>([])
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  
  const form = useForm<AssessmentFormValues>({
    resolver: zodResolver(assessmentFormSchema),
    defaultValues: {
      studentId: "",
      subject: "",
      title: "",
      description: "",
      dueDate: "",
    }
  })

  // Get context from URL
  const studentId = searchParams.get('studentId')
  const fromStudentDetail = !!studentId

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        setLoading(true)
        if (fromStudentDetail) {
          const response = await fetch(`/api/teacher/students/${studentId}`)
          if (!response.ok) throw new Error('Failed to fetch student')
          const data = await response.json()
          
          // Pre-populate form with student data
          setStudents([data])
          setSelectedStudent(studentId)
          form.setValue('studentId', studentId) // Set in form
          console.log('Setting studentId in form:', studentId)
          
          if (data.assignedSubjects?.length === 1) {
            const subject = `${data.assignedSubjects[0].area}-${data.assignedSubjects[0].name}`
            setSelectedSubject(subject)
            form.setValue('subject', subject)
          }
        } else {
          const response = await fetch('/api/teacher/assigned-students')
          if (!response.ok) throw new Error('Failed to fetch students')
          const data = await response.json()
          setStudents(data)
        }
      } catch (error) {
        console.error('Error fetching student details:', error)
        toast({
          title: "Error",
          description: "Failed to load student details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStudentDetails()
  }, [studentId, fromStudentDetail, form, toast])

  // Also watch for selectedStudent changes
  useEffect(() => {
    if (selectedStudent) {
      form.setValue('studentId', selectedStudent)
      console.log('Updated studentId in form:', selectedStudent)
    }
  }, [selectedStudent, form])

  // Fix the subject filtering with proper null checking
  const selectedStudentSubjects = React.useMemo(() => {
    const student = students.find(s => s.id === selectedStudent)
    if (!student?.assignedSubjects) return []
    return student.assignedSubjects
  }, [students, selectedStudent])

  // Handle form submission for first step
  const onContinue = form.handleSubmit((data) => {
    console.log('Form data:', data)
    setStep('questions')
  })

  // Add navigation handlers
  const handleCancel = () => {
    if (fromStudentDetail) {
      // Return to student detail page
      router.push(`/dashboard/teacher/students/${studentId}`)
    } else {
      // Return to assessments list
      router.push('/dashboard/teacher/assessments')
    }
  }

  // Add question handling functions
  const handleAddQuestion = (question: any) => {
    setQuestions([...questions, question])
    setEditingQuestion(null)
  }

  const handleRemoveQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id))
  }

  // Add final submission handler
  const handleSubmitAssessment = async () => {
    if (!session?.user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to create an assessment",
        variant: "destructive"
      })
      return
    }

    if (questions.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one question",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      const formData = form.getValues()
      
      // Explicitly construct assessment data to ensure studentId is included
      const assessmentData = {
        title: formData.title,
        description: formData.description,
        subject: selectedSubject,
        dueDate: formData.dueDate,
        studentId: selectedStudent, // Make sure this is explicitly set
        teacherId: session.user.id,
        questions,
        status: 'active',
        type: questions.some(q => q.type === 'file') 
          ? 'file_upload' 
          : questions.some(q => q.type === 'multiple_choice') 
            ? 'quiz' 
            : 'assignment'
      }

      console.log('Submitting assessment data:', {
        studentId: selectedStudent, // Log specifically
        formData,
        finalData: assessmentData
      })

      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assessmentData)
      })

      if (!response.ok) {
        throw new Error('Failed to create assessment')
      }

      const data = await response.json()
      toast({
        title: "Success",
        description: "Assessment created successfully"
      })
      router.push(`/dashboard/teacher/assessments/${data.id}`)
    } catch (error) {
      console.error('Submission error:', error)
      toast({
        title: "Error",
        description: "Failed to create assessment",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveDraft = async () => {
    if (!session?.user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to save draft",
        variant: "destructive"
      })
      return
    }

    setIsSavingDraft(true)

    try {
      const formData = form.getValues()
      const assessmentData = {
        ...formData,
        questions,
        teacherId: session.user.id,
        studentId: selectedStudent,
        status: 'draft',
        type: questions.some(q => q.type === 'file') 
          ? 'file_upload' 
          : questions.some(q => q.type === 'multiple_choice') 
            ? 'quiz' 
            : 'assignment'
      }

      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assessmentData)
      })

      if (!response.ok) {
        throw new Error('Failed to save draft')
      }

      const data = await response.json()

      toast({
        title: "Success",
        description: "Assessment saved as draft"
      })
      router.push(`/dashboard/teacher/assessments/${data.id}`)
    } catch (error) {
      console.error('Draft saving error:', error)
      toast({
        title: "Error",
        description: "Failed to save draft",
        variant: "destructive"
      })
    } finally {
      setIsSavingDraft(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container max-w-3xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Create New Assessment</h1>
            <p className="text-muted-foreground">
              {fromStudentDetail 
                ? `Create assessment for ${students[0]?.name}`
                : 'Create an assessment for your student'}
            </p>
          </div>
          {fromStudentDetail && (
            <Button variant="ghost" onClick={handleCancel}>
              Back to Student
            </Button>
          )}
        </div>
      </div>

      {step === 'details' ? (
        <Card className="p-8 w-full">
          <form onSubmit={onContinue} className="space-y-6">
            {/* Replace the form fields with react-hook-form fields */}
            <div className="space-y-4">
              {/* Student selection - hide if from student detail */}
              {!fromStudentDetail && (
                <div>
                  <Label>Student</Label>
                  <Select
                    value={selectedStudent}
                    onValueChange={(value) => {
                      setSelectedStudent(value)
                      form.setValue('studentId', value)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedStudent && (
                <div>
                  <Label>Subject</Label>
                  <Select 
                    value={selectedSubject} 
                    onValueChange={(value) => {
                      setSelectedSubject(value)
                      form.setValue('subject', value)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        selectedStudentSubjects.length === 0 
                          ? "No subjects available" 
                          : "Select subject"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedStudentSubjects.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No subjects available
                        </SelectItem>
                      ) : (
                        selectedStudentSubjects.map((subject) => (
                          <SelectItem 
                            key={subject._id}
                            value={`${subject.area}-${subject.name}`}
                          >
                            {subject.name} ({subject.area})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {selectedStudentSubjects.length === 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      No subjects are currently assigned to this student
                    </p>
                  )}
                </div>
              )}

              {selectedSubject && (
                <>
                  <div>
                    <Label>Title</Label>
                    <Input 
                      {...form.register('title')}
                      placeholder="Assessment title" 
                    />
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea 
                      {...form.register('description')}
                      placeholder="Assessment description" 
                    />
                  </div>

                  <div>
                    <Label>Due Date</Label>
                    <Input 
                      {...form.register('dueDate')}
                      type="datetime-local" 
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button type="submit">Continue to Questions</Button>
                  </div>
                </>
              )}
            </div>
          </form>
        </Card>
      ) : (
        <Card className="p-8 w-full">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{form.getValues('title')}</h2>
                <p className="text-muted-foreground">Add questions to your assessment</p>
              </div>
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  type="button"
                  onClick={() => setStep('details')}
                >
                  Back to Details
                </Button>
                <Button 
                  variant="secondary"
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={questions.length === 0 || isSavingDraft}
                >
                  {isSavingDraft ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving Draft...
                    </>
                  ) : (
                    'Save as Draft'
                  )}
                </Button>
                <Button 
                  type="button"
                  onClick={handleSubmitAssessment}
                  disabled={questions.length === 0 || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Assessment...
                    </>
                  ) : (
                    'Create Assessment'
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {!editingQuestion && (
                <Button onClick={() => setEditingQuestion('new')}>
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

              <ScrollArea className="h-[500px] pr-4">
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
                              {question.options?.map((option, i) => (
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
          </div>
        </Card>
      )}
    </div>
  )
}

export default Page
