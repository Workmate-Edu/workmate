import { FileIcon, Download } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Question } from '@/types/assessment'

interface ViewAssessmentProps {
  questions: Question[];
}

export function ViewAssessment({ questions }: ViewAssessmentProps) {
  return (
    <div className="space-y-6">
      {questions.map((question, index) => (
        <div key={question.id} className="border rounded-lg p-4">
          <div className="flex justify-between">
            <h3 className="font-medium">Question {index + 1}</h3>
            <span className="text-muted-foreground">{question.points} points</span>
          </div>
          
          <p className="mt-2">{question.question}</p>

          {question.attachment && (
            <div className="mt-4">
              <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                <FileIcon className="h-4 w-4" />
                <span className="flex-1 text-sm">{question.attachment.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(question.attachment?.url, '_blank')}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
