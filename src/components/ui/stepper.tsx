"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface StepperProps {
  steps: string[]
  currentStep: number
  onStepClick?: (step: number) => void
}

export function Stepper({ steps, currentStep, onStepClick }: StepperProps) {
  return (
    <div className="flex justify-between mb-8">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              currentStep === index
                ? "bg-primary text-primary-foreground"
                : currentStep > index
                ? "bg-primary/20 text-primary"
                : "bg-muted text-muted-foreground"
            )}
            onClick={() => onStepClick?.(index)}
          >
            {index + 1}
          </div>
          {index < steps.length - 1 && (
            <div 
              className={cn(
                "h-[2px] w-12",
                currentStep > index ? "bg-primary" : "bg-muted"
              )} 
            />
          )}
        </div>
      ))}
    </div>
  )
}
