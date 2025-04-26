"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface AssessmentOption {
  id: string
  text: string
  icon?: string
  description?: string
  followUp?: string
}

interface AssessmentQuestionProps {
  question: string
  options: AssessmentOption[]
  type: 'single_choice' | 'multiple_choice'
  onAnswer: (answer: string | string[]) => void
}

export function LanguageAssessmentQuestion({
  question,
  options,
  type,
  onAnswer
}: AssessmentQuestionProps) {
  const [selected, setSelected] = useState<string[]>([])

  const handleSelect = (optionId: string) => {
    if (type === 'single_choice') {
      setSelected([optionId])
      onAnswer(optionId)
    } else {
      const newSelected = selected.includes(optionId)
        ? selected.filter(id => id !== optionId)
        : [...selected, optionId]
      setSelected(newSelected)
      onAnswer(newSelected)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-center">{question}</h2>
      
      <div className="grid gap-4">
        {options.map((option) => (
          <Card
            key={option.id}
            className={cn(
              "p-4 cursor-pointer transition-all hover:bg-accent",
              selected.includes(option.id) && "border-primary bg-primary/5"
            )}
            onClick={() => handleSelect(option.id)}
          >
            <div className="flex items-center gap-3">
              {option.icon && (
                <span className="text-2xl">{option.icon}</span>
              )}
              <div>
                <p className="font-medium">{option.text}</p>
                {option.description && (
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {type === 'multiple_choice' && (
        <Button 
          className="w-full"
          onClick={() => onAnswer(selected)}
          disabled={selected.length === 0}
        >
          Continue
        </Button>
      )}
    </div>
  )
}
