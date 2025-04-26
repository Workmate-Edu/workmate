"use client"

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LanguageAssessmentQuestion } from "@/components/assessment/language-assessment-question"
import { languageAssessmentQuestions } from "@/data/initial-assessments/language-assessment"
import { Progress } from "@/components/ui/progress"

const assessmentSteps = [
  'motivation',
  'proficiency',
  'goals',
  'schedule',
  'learningStyle'
] as const

export default function InitialAssessmentPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [selectedLanguage, setSelectedLanguage] = useState("Yoruba")

  const currentSection = assessmentSteps[currentStep]
  const question = languageAssessmentQuestions[currentSection]
  const progress = ((currentStep + 1) / assessmentSteps.length) * 100

  const handleAnswer = (answer: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [currentSection]: answer
    }))
    
    if (currentStep < assessmentSteps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleComplete()
    }
  }

  const handleComplete = async () => {
    try {
      const response = await fetch('/api/assessments/initial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: selectedLanguage,
          answers
        })
      })

      if (!response.ok) throw new Error('Failed to save assessment')
      
      // Handle success - maybe redirect or show results
    } catch (error) {
      console.error('Assessment submission error:', error)
    }
  }

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Initial Language Assessment</h1>
          <p className="text-muted-foreground">
            Understanding student goals and current level for {selectedLanguage}
          </p>
        </div>

        <Progress value={progress} className="h-2" />

        <Card className="p-6">
          <LanguageAssessmentQuestion
            question={question.question.replace('{language}', selectedLanguage)}
            options={question.options}
            type={question.type}
            onAnswer={handleAnswer}
          />
        </Card>

        {currentStep > 0 && (
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => prev - 1)}
          >
            Back
          </Button>
        )}
      </div>
    </div>
  )
}
