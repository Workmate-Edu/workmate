'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AssessmentForm } from '@/components/assessment/assessment-form'
import { Atom, Brain, Trophy } from 'lucide-react'

const stemQuestions = [
  {
    id: 1,
    question: "What's your primary goal in studying STEM subjects?",
    options: [
      "Academic excellence and higher education",
      "Career development in STEM fields",
      "Personal interest and curiosity",
      "Problem-solving skill development"
    ],
    type: 'multiple-choice' as const
  },
  {
    id: 2,
    question: "Rate your confidence level in Mathematics",
    options: ["1", "2", "3", "4", "5"],
    type: 'rating' as const
  },
  {
    id: 3,
    question: "Which area of Science interests you the most?",
    options: [
      "Physics and Astronomy",
      "Chemistry and Materials",
      "Biology and Life Sciences",
      "Environmental Science"
    ],
    type: 'multiple-choice' as const
  },
  {
    id: 4,
    question: "What's your experience with programming or coding?",
    options: [
      "Complete beginner",
      "Some basic knowledge",
      "Intermediate skills",
      "Advanced programmer"
    ],
    type: 'multiple-choice' as const
  },
  {
    id: 5,
    question: "Describe a STEM-related project or problem you'd like to work on",
    options: [],
    type: 'text' as const
  }
]

export default function STEMAssessment() {
  const router = useRouter()
  const [isComplete, setIsComplete] = useState(false)
  const [results, setResults] = useState<any>(null)

  const handleComplete = (answers: any) => {
    setResults(answers)
    setIsComplete(true)
    // Here you would typically send the results to your backend
    // For now, we'll just show a success message
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
              Based on your responses, we'll create a personalized STEM learning path for you.
            </p>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-lg mb-8">
            <h2 className="text-xl font-semibold mb-4">Your Learning Profile</h2>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Brain className="w-5 h-5 text-primary" />
                  <span className="font-medium">Learning Style</span>
                </div>
                <p className="text-muted-foreground">
                  You show a strong preference for {results[0].toLowerCase()} in STEM subjects.
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Atom className="w-5 h-5 text-primary" />
                  <span className="font-medium">Key Interests</span>
                </div>
                <p className="text-muted-foreground">
                  Your interests align strongly with {results[2]}.
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
            <Atom className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-4">STEM Learning Assessment</h1>
          <p className="text-lg text-muted-foreground">
            Let's understand your STEM learning goals and preferences to create a personalized learning path.
          </p>
        </div>

        <AssessmentForm
          subject="stem"
          questions={stemQuestions}
          onComplete={handleComplete}
        />
      </div>
    </div>
  )
}
