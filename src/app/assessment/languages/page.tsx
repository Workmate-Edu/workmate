'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AssessmentForm } from '@/components/assessment/assessment-form'
import { Globe, MessageCircle, Trophy } from 'lucide-react'

const languageQuestions = [
  {
    id: 1,
    question: "What's your primary motivation for learning a new language?",
    options: [
      "Professional development",
      "Academic requirements",
      "Travel and culture",
      "Personal interest"
    ],
    type: 'multiple-choice' as const
  },
  {
    id: 2,
    question: "Rate your current level in your target language",
    options: ["1", "2", "3", "4", "5"],
    type: 'rating' as const
  },
  {
    id: 3,
    question: "Which language skill do you want to focus on the most?",
    options: [
      "Speaking and Conversation",
      "Reading and Comprehension",
      "Writing and Grammar",
      "Listening and Pronunciation"
    ],
    type: 'multiple-choice' as const
  },
  {
    id: 4,
    question: "How much time can you dedicate to language learning per week?",
    options: [
      "1-2 hours",
      "3-5 hours",
      "6-10 hours",
      "More than 10 hours"
    ],
    type: 'multiple-choice' as const
  },
  {
    id: 5,
    question: "What specific goals do you have for using this language?",
    options: [],
    type: 'text' as const
  }
]

export default function LanguageAssessment() {
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
              We'll create a personalized language learning journey based on your goals and preferences.
            </p>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-lg mb-8">
            <h2 className="text-xl font-semibold mb-4">Your Language Learning Profile</h2>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Globe className="w-5 h-5 text-primary" />
                  <span className="font-medium">Learning Focus</span>
                </div>
                <p className="text-muted-foreground">
                  Your primary focus will be on {results[2].toLowerCase()}.
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  <span className="font-medium">Time Commitment</span>
                </div>
                <p className="text-muted-foreground">
                  You plan to dedicate {results[3]} per week to language learning.
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
            <Globe className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Language Learning Assessment</h1>
          <p className="text-lg text-muted-foreground">
            Help us understand your language learning goals and preferences to create your perfect learning path.
          </p>
        </div>

        <AssessmentForm
          subject="languages"
          questions={languageQuestions}
          onComplete={handleComplete}
        />
      </div>
    </div>
  )
}
