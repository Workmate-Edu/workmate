import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import { GraduationCap, BarChart2, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Student {
  id: string
  name: string
  grade?: string
  progress?: number
}

interface UpdateProgressDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  students: Array<{
    id: string
    name: string
    grade?: string
    progress?: number
  }>
  subjectId: string // This will be the subject name
  onSuccess?: () => void
}

export function UpdateProgressDialog({
  open,
  onOpenChange,
  students, // Already filtered students from course detail
  subjectId, // From courseId.split('-')[0]
  onSuccess,
}: UpdateProgressDialogProps) {
  const [selectedStudent, setSelectedStudent] = useState<string>("")
  const [progress, setProgress] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedStudent("")
      setProgress(0)
    }
  }, [open])

  // Get current progress when student is selected
  useEffect(() => {
    if (selectedStudent) {
      const student = students.find((s) => s.id === selectedStudent)
      setProgress(student?.progress || 0)
    }
  }, [selectedStudent, students])

  const handleSubmit = async () => {
    if (!selectedStudent) {
      toast.error("Please select a student")
      return
    }

    setIsSubmitting(true)
    try {
      console.log('Updating progress:', {
        studentId: selectedStudent,
        subjectId: subjectId, // This is the subject name
        progress
      })

      const res = await fetch('/api/teacher/progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent,
          subjectId, // This will be the subject name (e.g. 'yoruba')
          progress
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error)
      }

      toast.success("Progress updated successfully")
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update progress"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Student Progress</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Select Student</Label>
            <Select
              value={selectedStudent}
              onValueChange={setSelectedStudent}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a student" />
              </SelectTrigger>
              <SelectContent>
                <ScrollArea className="max-h-[200px]">
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        <div>
                          <span>{student.name}</span>
                          {student.grade && (
                            <span className="ml-2 text-muted-foreground">
                              (Grade {student.grade})
                            </span>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>
          </div>

          {selectedStudent && (
            <div className="space-y-4">
              <Label>Progress ({progress}%)</Label>
              <Slider
                value={[progress]}
                onValueChange={([value]) => setProgress(value)}
                min={0}
                max={100}
                step={5}
                className="py-4"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedStudent}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <BarChart2 className="mr-2 h-4 w-4" />
                Update Progress
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
