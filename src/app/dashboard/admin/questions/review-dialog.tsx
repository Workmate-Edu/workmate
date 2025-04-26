"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useState } from "react"
import type { QuestionBank } from "@/types/questions"

interface ReviewDialogProps {
  question: QuestionBank | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onReviewComplete: () => void
}

export function ReviewDialog({
  question,
  open,
  onOpenChange,
  onReviewComplete
}: ReviewDialogProps) {
  const [feedback, setFeedback] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAction = async (action: 'approved' | 'rejected') => {
    if (!question) return;
    
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/questions/${question.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: action,
          feedback: feedback || undefined // Only send if provided
        })
      });

      if (!res.ok) throw new Error('Failed to update question');
      
      toast.success(`Question ${action}`);
      onReviewComplete();
      onOpenChange(false);
    } catch (error) {
      toast.error(`Failed to ${action} question`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Review Question</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Question</h3>
            <p className="text-muted-foreground">{question?.question.text}</p>
          </div>

          <div>
            <label className="font-medium mb-2">Feedback</label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Enter feedback for the teacher..."
              className="h-24"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isSubmitting}
              onClick={() => handleAction('rejected')}
            >
              Reject
            </Button>
            <Button
              onClick={() => handleAction('approved')}
              disabled={isSubmitting}
            >
              Approve
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
