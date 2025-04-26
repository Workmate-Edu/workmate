"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface TeacherRejectionDialogProps {
  isOpen: boolean
  teacherName: string
  teacherId?: string
  onClose: () => void
  onReject: (data: { reason: string, feedback: string }) => Promise<void>
}

export function TeacherRejectionDialog({
  isOpen,
  teacherName,
  onClose,
  onReject
}: TeacherRejectionDialogProps) {
  const [reason, setReason] = useState("")
  const [feedback, setFeedback] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!reason.trim() || !feedback.trim()) {
      toast.error("Please provide both reason and feedback")
      return
    }

    setIsSubmitting(true)
    try {
      await onReject({ reason, feedback })
      setReason("")
      setFeedback("")
      onClose()
      toast.success("Teacher application rejected")
    } catch (error) {
      toast.error("Failed to reject teacher application")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Teacher Application</DialogTitle>
          <DialogDescription>
            Provide details for rejecting {teacherName}'s application. This information will be sent to them via email.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Rejection Reason</label>
            <Textarea
              placeholder="Primary reason for rejection..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Constructive Feedback</label>
            <Textarea
              placeholder="Provide constructive feedback for improvement..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={isSubmitting || !reason.trim() || !feedback.trim()}
          >
            {isSubmitting ? "Rejecting..." : "Confirm Rejection"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
