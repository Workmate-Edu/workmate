'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useRouter } from 'next/navigation'
import { ArrowRight, Brain, BookOpen, FlaskConical, Globe2, GraduationCap, Users } from 'lucide-react'
import { useSession } from 'next-auth/react'

// First, choose assessment type
const AssessmentType = {
  KIDS: 'kids',
  INDEPENDENT: 'independent'
}

// Separate questions for kids and independent learners
const questions = {
  kids: [
    {
      id: 'learning_style',
      question: "How does your child prefer to learn new things?",
      options: [
        { id: 'visual', label: 'Through pictures and videos', icon: Brain },
        { id: 'hands_on', label: 'By doing experiments and activities', icon: FlaskConical },
        { id: 'audio', label: 'By listening and speaking', icon: BookOpen },
        { id: 'mixed', label: 'A mix of different ways', icon: Globe2 },
      ]
    },
    {
      id: 'interests',
      question: "What interests your child the most?",
      options: [
        { id: 'languages', label: 'Learning new languages and cultures' },
        { id: 'science', label: 'Science experiments and discoveries' },
        { id: 'both', label: 'Both languages and science equally' },
      ]
    },
    {
      id: 'language_preference',
      question: "Which African language would they like to start with?",
      options: [
        { id: 'yoruba', label: 'Yoruba', flag: '🇳🇬' },
        { id: 'hausa', label: 'Hausa', flag: '🇳🇬' },
        { id: 'swahili', label: 'Swahili', flag: '🇹🇿' },
        { id: 'not_sure', label: 'Not sure yet', flag: '🌍' },
      ]
    },
    {
      id: 'stem_focus',
      question: "Which STEM subjects excite them most?",
      options: [
        { id: 'math', label: 'Mathematics and Problem Solving' },
        { id: 'science', label: 'Science Experiments' },
        { id: 'coding', label: 'Basic Coding and Technology' },
        { id: 'all', label: 'All of the above' },
      ]
    }
  ],
  independent: [
    {
      id: 'learning_goal',
      question: "What's your primary goal for learning?",
      options: [
        { id: 'heritage', label: 'Connect with Heritage', icon: Globe2 },
        { id: 'business', label: 'Business Communication', icon: Users },
        { id: 'travel', label: 'Travel & Culture', icon: Brain },
        { id: 'academic', label: 'Academic Purpose', icon: GraduationCap },
      ]
    },
    {
      id: 'language_proficiency',
      question: "What's your current level in the language?",
      options: [
        { id: 'beginner', label: 'Beginner - I know nothing yet' },
        { id: 'intermediate', label: 'Intermediate - I know some basics' },
        { id: 'advanced', label: 'Advanced - I am almost fluent' },
      ]
    },
    {
      id: 'learning_preference',
      question: "How do you prefer to learn?",
      options: [
        { id: 'self_paced', label: 'Self-paced online courses' },
        { id: 'classroom', label: 'In a classroom with a teacher' },
        { id: 'immersion', label: 'Immersion by traveling' },
      ]
    },
    {
      id: 'goals',
      question: "What are your goals for learning this language?",
      options: [
        { id: 'fluency', label: 'Become fluent' },
        { id: 'basic_communication', label: 'Basic communication' },
        { id: 'reading_writing', label: 'Reading and writing' },
        { id: 'travel', label: 'Travel purposes' },
      ]
    }
  ]
}

export default function AssessmentPage() {
  const [assessmentType, setAssessmentType] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const router = useRouter()
  const { data: session } = useSession()

  const handleBack = () => {
    if (currentStep === 0) {
      setAssessmentType(null)
      setAnswers({})
    } else {
      setCurrentStep(prev => prev - 1)
    }
  }

  if (!assessmentType) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container max-w-3xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-4">Choose Your Learning Path</h1>
            <p className="text-muted-foreground">Select the type of assessment to begin</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <Button
              variant="outline"
              className="p-8 h-auto flex flex-col items-center gap-4 hover:border-primary hover:bg-primary/5"
              onClick={() => setAssessmentType(AssessmentType.KIDS)}
            >
              <GraduationCap className="h-12 w-12 text-primary" />
              <h3 className="text-lg font-semibold">For Kids (Ages 6-16)</h3>
              <p className="text-sm text-muted-foreground">
                Language learning and STEM education for young minds
              </p>
            </Button>

            <Button
              variant="outline"
              className="p-8 h-auto flex flex-col items-center gap-4 hover:border-secondary hover:bg-secondary/5"
              onClick={() => setAssessmentType(AssessmentType.INDEPENDENT)}
            >
              <Users className="h-12 w-12 text-secondary" />
              <h3 className="text-lg font-semibold">For Independent Learners</h3>
              <p className="text-sm text-muted-foreground">
                African language learning for adults and professionals
              </p>
            </Button>
          </div>
        </div>
      </main>
    )
  }

  const progress = ((currentStep + 1) / questions[assessmentType].length) * 100

  const handleAnswer = (answerId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questions[assessmentType][currentStep].id]: answerId
    }))

    if (currentStep === questions[assessmentType].length - 1) {
      // Last question - submit assessment
      handleSubmit()
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleSubmit = () => {
    if (assessmentType === AssessmentType.KIDS) {
      if (session) {
        // If logged in, go to parent dashboard to add child
        router.push('/dashboard/parent/add-child?assessment=' + JSON.stringify(answers))
      } else {
        // If not logged in, go to signup with assessment data
        router.push('/sign-up?type=parent&assessment=' + JSON.stringify(answers))
      }
    } else {
      if (session) {
        // If logged in, go to student dashboard
        router.push('/dashboard/student?assessment=' + JSON.stringify(answers))
      } else {
        // If not logged in, go to signup with assessment data
        router.push('/sign-up?type=student&assessment=' + JSON.stringify(answers))
      }
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">
            Let's Find Your Child's Perfect Learning Path
          </h1>
          <p className="text-muted-foreground">
            Quick 2-minute assessment to personalize their learning journey
          </p>
        </div>

        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            Back
          </Button>
          <Progress 
            value={progress} 
            className="w-[200px]" 
          />
          <div className="w-[70px]">
            {currentStep + 1} / {questions[assessmentType].length}
          </div>
        </div>

        <div className="space-y-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold mb-2">
              {questions[assessmentType][currentStep].question}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {questions[assessmentType][currentStep].options.map((option) => {
              const Icon = option.icon
              return (
                <Button
                  key={option.id}
                  variant="outline"
                  className="p-6 h-auto flex flex-col items-center gap-4 hover:border-primary hover:bg-primary/5"
                  onClick={() => handleAnswer(option.id)}
                >
                  {Icon && <Icon className="h-8 w-8 text-primary" />}
                  {option.flag && <span className="text-2xl">{option.flag}</span>}
                  <span className="text-base font-medium">{option.label}</span>
                </Button>
              )
            })}
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            Previous
          </Button>
          {currentStep < questions[assessmentType].length - 1 && (
            <Button
              onClick={() => setCurrentStep(prev => prev + 1)}
              disabled={!answers[questions[assessmentType][currentStep].id]}
              className="flex items-center gap-2"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
          {currentStep === questions[assessmentType].length - 1 && (
            <Button
              onClick={handleSubmit}
              disabled={!answers[questions[assessmentType][currentStep].id]}
              className="flex items-center gap-2"
            >
              Complete
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </main>
  )
}
