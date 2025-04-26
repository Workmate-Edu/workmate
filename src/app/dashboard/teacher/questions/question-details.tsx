"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { QuestionBank } from "@/types/questions"
import { Edit, Trash } from "lucide-react"

interface QuestionDetailsProps {
  question: QuestionBank | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: () => void
  onDelete: () => void
}

export function QuestionDetails({
  question,
  open,
  onOpenChange,
  onEdit,
  onDelete
}: QuestionDetailsProps) {
  if (!question) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Question Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">Subject</h3>
              <p>{question.subject.name}</p>
            </div>
            <div className="space-x-2">
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={onDelete}>
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Question</h3>
            <p className="text-muted-foreground">{question.question.text}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Level</h3>
              <Badge variant="outline">{question.level}</Badge>
            </div>
            <div>
              <h3 className="font-medium mb-2">Type</h3>
              <Badge>{question.type}</Badge>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Metadata</h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Difficulty: {question.metadata.difficulty}</p>
              <p>Estimated Time: {question.metadata.estimatedTime} minutes</p>
              <div className="flex gap-1">
                {question.metadata.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
