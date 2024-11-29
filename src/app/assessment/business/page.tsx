'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AssessmentForm } from '@/components/assessment/assessment-form'
import { Briefcase, Target, Trophy } from 'lucide-react'

const businessQuestions = [
  {
    id: 1,
    question: "What's your primary business learning objective?",
    options: [
      "Start a new business",
      "Grow existing business",
      "Career advancement",
      "Academic knowledge"
    ],
    type: 'multiple-choice' as const
  },
  {
    id: 2,
    question: "Rate your current business experience level",
    options: ["1", "2", "3", "4", "5"],
    type: 'rating' as const
  },
  {
    id: 3,
    question: "Which business area interests you the most?",
    options: [
      "Entrepreneurship and Innovation",
      "Marketing and Sales",
      "Finance and Investment",
      "Management and Leadership"
    ],
    type: 'multiple-choice' as const
  },
  {
    id: 4,
    question: "What's your preferred learning approach?",
    options: [
      "Case Studies and Real Examples",
      "Theoretical Concepts",
      "Practical Projects",
      "Networking and Discussion"
    ],
    type: 'multiple-choice' as const
  },
  {
    id: 5,
    question: "Describe your business goals or project ideas",
    options: [],
    type: 'text' as const
  }
]

export default function BusinessAssessment() {
  const router = useRouter()
  const [isComplete, setIsComplete] = useState(false)
  const [results, setResults] = useState<any>(null)

  const handleComplete = (answers: any) => {
    setResults(answers)
    setIsComplete(true)
    // Here you would typically send the results to your backend
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="inline-block p-3 rounded-full bg-primary/10 mb-4">
              <Trophy className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Assessment Complete!</h1>
            <p className="text-lg text-muted-foreground">
              We'll create a personalized business education path tailored to your goals and experience level.
            </p>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-lg mb-8">
            <h2 className="text-xl font-semibold mb-4">Your Business Learning Profile</h2>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="w-5 h-5 text-primary" />
                  <span className="font-medium">Focus Area</span>
                </div>
                <p className="text-muted-foreground">
                  Your primary interest lies in {results[2]}.
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  <span className="font-medium">Learning Style</span>
                </div>
                <p className="text-muted-foreground">
                  You prefer learning through {results[3].toLowerCase()}.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
            >
              View Your Learning Path
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-block p-3 rounded-full bg-primary/10 mb-4">
            <Briefcase className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Business Learning Assessment</h1>
          <p className="text-lg text-muted-foreground">
            Let's understand your business goals and experience to create a tailored learning journey.
          </p>
        </div>

        <AssessmentForm
          subject="business"
          questions={businessQuestions}
          onComplete={handleComplete}
        />
      </div>
    </div>
  )
}
