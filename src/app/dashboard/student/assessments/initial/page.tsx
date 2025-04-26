"use client"

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { ArrowRight, BookOpen, Loader2, Target, Clock } from "lucide-react"

const subjects = {
  languages: ['Yoruba', 'Hausa', 'Igbo', 'Arabic', 'Swahili'],
  stem: ['Math', 'Physics', 'Chemistry', 'Biology', 'Computer Science']
}

export default function InitialAssessmentPage() {
  const { data: session } = useSession()
  const router = useRouter()
  
  // Initialize state based on URL params
  const [initialized, setInitialized] = useState(false)
  const [category, setCategory] = useState<'languages' | 'stem' | ''>('')
  const [subject, setSubject] = useState('')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions = [
    "What's your current level of experience?",
    "How much time can you dedicate to learning?",
    "What are your main goals?"
  ]

  useEffect(() => {
    // Get params after component mounts to avoid hydration issues
    const params = new URLSearchParams(window.location.search)
    const preSelectedSubject = params.get('subject')
    const preSelectedArea = params.get('area')

    if (preSelectedSubject && preSelectedArea) {
      setCategory(preSelectedArea.toLowerCase() as 'languages' | 'stem')
      setSubject(preSelectedSubject)
      setCurrentQuestion(0)
    }
    setInitialized(true)
  }, [])

  // Check if assessment already exists for the subject
  useEffect(() => {
    const checkExistingAssessment = async (subj: string) => {
      try {
        const res = await fetch('/api/student/assessments')
        if (!res.ok) throw new Error('Failed to fetch assessments')
        const assessments = await res.json()
        
        const exists = assessments.some((a: any) => 
          a.subject.name.toLowerCase() === subj.toLowerCase()
        )

        if (exists) {
          toast.error('You have already completed an assessment for this subject')
          router.push('/dashboard/student')
        }
      } catch (error) {
        console.error(error)
      }
    }

    if (subject) {
      checkExistingAssessment(subject)
    }
  }, [subject, router])

  // Don't render anything until we've checked URL params
  if (!initialized) return null

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Format data for submission with proper questions
      const data = {
        subject: {
          name: subject,
          area: category
        },
        responses: [{
          category: "Initial Assessment",
          questions: Object.entries(answers).map(([index, answer]) => ({
            questionId: index,
            question: questions[Number(index)],
            answer
          }))
        }]
      }

      const response = await fetch('/api/assessments/initial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.details || 'Failed to submit assessment')
      }
      
      toast.success('Assessment submitted successfully!')
      router.push('/dashboard/student')
    } catch (error) {
      console.error('Submission error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to submit assessment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const steps = [
    {
      title: "Select Category",
      description: "Choose between Languages or STEM subjects",
      icon: BookOpen
    },
    {
      title: "Choose Subject",
      description: "Select the specific subject you want to learn",
      icon: Target
    },
    {
      title: "Assessment",
      description: "Answer a few questions about your goals and experience",
      icon: Clock
    }
  ]

  const renderStepIndicator = () => {
    // Skip progress steps if pre-selected
    if (category && subject) {
      return (
        <div className="mb-8">
          <Progress 
            value={(currentQuestion + 1) / 3 * 100} 
            className="h-2 mb-4" 
          />
          <p className="text-center text-sm text-muted-foreground">
            Assessment Progress
          </p>
        </div>
      )
    }

    const currentStep = !category ? 0 : !subject ? 1 : 2
    const progress = ((currentStep + 1) / steps.length) * 100

    return (
      <div className="mb-8">
        <Progress value={progress} className="h-2 mb-4" />
        <div className="grid grid-cols-3 gap-4">
          {steps.map((step, index) => {
            const StepIcon = step.icon
            return (
              <div 
                key={step.title}
                className={`text-center ${index === currentStep ? 'text-primary' : 
                  index < currentStep ? 'text-muted-foreground' : 'text-muted'}`}
              >
                <div className="flex justify-center mb-2">
                  <div className={`p-2 rounded-full ${
                    index === currentStep ? 'bg-primary/10' : 
                    index < currentStep ? 'bg-muted' : 'bg-muted/50'
                  }`}>
                    <StepIcon className="w-5 h-5" />
                  </div>
                </div>
                <p className="font-medium text-sm">{step.title}</p>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Skip straight to questions if we have a pre-selected subject
  const shouldShowQuestions = category && subject

  const renderContent = () => {
    // If we have pre-selected values and states are set, show questions immediately
    if (shouldShowQuestions) {
      return (
        <div className="space-y-6">
          <Progress value={(currentQuestion + 1) / questions.length * 100} />
          <div>
            <h2 className="font-medium mb-4">{questions[currentQuestion]}</h2>
            <Select 
              onValueChange={(value) => {
                setAnswers(prev => ({ ...prev, [currentQuestion]: value }))
                if (currentQuestion < questions.length - 1) {
                  setCurrentQuestion(prev => prev + 1)
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your answer" />
              </SelectTrigger>
              <SelectContent>
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

          {Object.keys(answers).length === questions.length && (
            <Button 
              className="w-full" 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span>Submitting Assessment...</span>
                </div>
              ) : (
                'Submit Assessment'
              )}
            </Button>
          )}
        </div>
      )
    }

    // Only show category/subject selection if no pre-selected subject
    if (!category) {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: 'languages', label: 'Languages', icon: '🗣️', description: 'Learn African languages and cultures' },
              { value: 'stem', label: 'STEM', icon: '🔬', description: 'Study Science, Tech, Engineering & Math' }
            ].map((cat) => (
              <Card 
                key={cat.value}
                className={`p-6 cursor-pointer transition-all hover:border-primary ${
                  category === cat.value ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => setCategory(cat.value as 'languages' | 'stem')}
              >
                <div className="text-center space-y-2">
                  <span className="text-4xl">{cat.icon}</span>
                  <h3 className="font-medium">{cat.label}</h3>
                  <p className="text-sm text-muted-foreground">{cat.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )
    }

    if (!subject) {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {subjects[category].map((sub) => (
              <Card 
                key={sub}
                className={`p-6 cursor-pointer transition-all hover:border-primary ${
                  subject === sub ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => setSubject(sub)}
              >
                <h3 className="font-medium text-center">{sub}</h3>
              </Card>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <Progress value={(currentQuestion + 1) / questions.length * 100} />
        
        <div>
          <h2 className="font-medium mb-4">{questions[currentQuestion]}</h2>
          <Select 
            onValueChange={(value) => {
              setAnswers(prev => ({ ...prev, [currentQuestion]: value }))
              if (currentQuestion < questions.length - 1) {
                setCurrentQuestion(prev => prev + 1)
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your answer" />
            </SelectTrigger>
            <SelectContent>
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

        {Object.keys(answers).length === questions.length && (
          <Button 
            className="w-full" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>Submitting Assessment...</span>
              </div>
            ) : (
              'Submit Assessment'
            )}
          </Button>
        )}
      </div>
    )
  }

  const getHeaderContent = () => {
    // Override header content for pre-selected subjects
    if (category && subject) {
      return {
        title: `${subject} Assessment`,
        description: `Let's evaluate your current level and goals for ${subject}`
      }
    }

    if (!category) {
      return {
        title: "Initial Assessment",
        description: "Let's understand your goals and current level to match you with the right teacher"
      }
    }

    if (!subject) {
      return {
        title: `${category === 'languages' ? 'Languages' : 'STEM'} Assessment`,
        description: category === 'languages' 
          ? "Choose a language you want to learn" 
          : "Select a STEM subject you want to study"
      }
    }

    return {
      title: `${subject} Assessment`,
      description: `Let's evaluate your current level and goals for ${subject}`
    }
  }

  // Remove the back button for pre-selected subjects
  const showBackButton = !category && (category || subject)

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      <Card className="p-8">
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">
              {shouldShowQuestions 
                ? `${subject} Assessment`
                : getHeaderContent().title
              }
            </h1>
            <p className="text-muted-foreground mt-2">
              {shouldShowQuestions
                ? `Let's evaluate your current level and goals for ${subject}`
                : getHeaderContent().description
              }
            </p>
            {category && (
              <Badge variant="outline" className="mt-4">
                {category === 'languages' ? 'Languages' : 'STEM'}
              </Badge>
            )}
          </div>

          {!shouldShowQuestions && !category ? renderStepIndicator() : null}
          {renderContent()}

          {/* Back button only for manual selection flow */}
          {!category && (category || subject) && (
            <Button
              variant="outline"
              onClick={() => {
                if (subject) {
                  setSubject('')
                  setCurrentQuestion(0)
                  setAnswers({})
                } else {
                  setCategory('')
                }
              }}
              className="mt-4"
            >
              Back
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
