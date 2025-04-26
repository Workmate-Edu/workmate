"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import type { InitialAssessment } from "@/types/assessment"

interface AssignTeacherDialogProps {
  assessment: InitialAssessment | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAssigned: () => void
}

export function AssignTeacherDialog({
  assessment,
  open,
  onOpenChange,
  onAssigned
}: AssignTeacherDialogProps) {
  const [selectedTeacher, setSelectedTeacher] = useState("")
  const [availableTeachers, setAvailableTeachers] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Fetch available teachers when dialog opens
  React.useEffect(() => {
    if (open && assessment) {
      fetchTeachers()
    }
  }, [open, assessment])

  const fetchTeachers = async () => {
    try {
      const res = await fetch(`/api/teachers?subject=${assessment?.subject.name}`)
      const data = await res.json()
      setAvailableTeachers(data)
    } catch (error) {
      toast.error("Failed to load available teachers")
    }
  }

  const handleAssign = async () => {
    if (!selectedTeacher || !assessment) return

    setIsLoading(true)
    try {
      const res = await fetch(`/api/assessments/initial/${assessment.id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherId: selectedTeacher })
      })

      if (!res.ok) throw new Error('Failed to assign teacher')

      toast.success("Teacher assigned successfully")
      onAssigned()
      onOpenChange(false)
    } catch (error) {
      toast.error("Failed to assign teacher")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Assign Teacher</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Student Info */}
          <div className="grid gap-4">
            <div>
              <h3 className="font-medium">Student Details</h3>
              <p>{assessment?.studentId.name}</p>
              <p className="text-sm text-muted-foreground">
                Subject: {assessment?.subject.name}
              </p>
            </div>

            {/* Assessment Results */}
            <div>
              <h3 className="font-medium">Assessment Results</h3>
              <div className="mt-2 space-y-2">
                {assessment?.responses.map((response, index) => (
                  <div key={index} className="text-sm">
                    <p className="text-muted-foreground">
                      {index === 0 && "Level: "}
                      {index === 1 && "Time Commitment: "}
                      {index === 2 && "Learning Goals: "}
                      <span className="text-foreground ml-1">{response.answer}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Teacher Selection */}
            <div>
              <h3 className="font-medium mb-2">Available Teachers</h3>
              <Select
                value={selectedTeacher}
                onValueChange={setSelectedTeacher}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a teacher..." />
                </SelectTrigger>
                <SelectContent>
                  {availableTeachers.map(teacher => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      <div className="flex justify-between items-center">
                        <span>{teacher.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {teacher.activeStudents} students
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={!selectedTeacher || isLoading}
            >
              {isLoading ? "Assigning..." : "Assign Teacher"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
