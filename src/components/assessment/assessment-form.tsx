'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react'

interface Question {
  id: number
  question: string
  options: string[]
  type: 'multiple-choice' | 'rating' | 'text'
}

interface AssessmentFormProps {
  subject: string
  questions: Question[]
  onComplete: (results: any) => void
}

export function AssessmentForm({ subject, questions, onComplete }: AssessmentFormProps) {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, any>>({})
  const [error, setError] = useState('')

  const handleAnswer = (answer: any) => {
    setAnswers(prev => ({ ...prev, [currentQuestion]: answer }))
    setError('')
  }

  const handleNext = () => {
    if (!answers[currentQuestion]) {
      setError('Please select an answer before continuing')
      return
    }

    if (currentQuestion === questions.length - 1) {
      onComplete(answers)
    } else {
      setCurrentQuestion(prev => prev + 1)
    }
  }

  const renderQuestion = (question: Question) => {
    switch (question.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-4">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                className={`w-full text-left p-4 rounded-lg transition-all ${
                  answers[currentQuestion] === option
                    ? 'bg-primary text-white'
                    : 'bg-card hover:bg-primary/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    answers[currentQuestion] === option
                      ? 'bg-white text-primary'
                      : 'bg-muted'
                  }`}>
                    {answers[currentQuestion] === option && (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>
        )

      case 'rating':
        return (
          <div className="flex justify-center gap-4">
            {[1, 2, 3, 4, 5].map(rating => (
              <button
                key={rating}
                onClick={() => handleAnswer(rating)}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-medium transition-all ${
                  answers[currentQuestion] === rating
                    ? 'bg-primary text-white'
                    : 'bg-card hover:bg-primary/10'
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
        )

      case 'text':
        return (
          <textarea
            value={answers[currentQuestion] || ''}
            onChange={e => handleAnswer(e.target.value)}
            className="w-full p-4 rounded-lg bg-card min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Type your answer here..."
          />
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="h-2 bg-muted rounded-full">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Question {currentQuestion + 1} of {questions.length}
        </p>
      </div>

      {/* Question */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">
          {questions[currentQuestion].question}
        </h3>
        {renderQuestion(questions[currentQuestion])}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-destructive mb-4">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-end">
        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-6 py-2 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors"
        >
          {currentQuestion === questions.length - 1 ? 'Complete' : 'Next'}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
