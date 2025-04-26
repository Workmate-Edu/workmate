"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { toast } from "sonner"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select"

interface Course {
  _id: string // This should be subjectId
  name: string
  area: string
  isTeaching: boolean
}

interface Student {
  id: string
  name: string
  courses: Course[]
}

interface Progress {
  understanding: number
  participation: number
  homework: number
  notes: string
}

interface ProgressUpdateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  student: Student
  onSuccess?: () => void
}

export function ProgressUpdateDialog({
  open,
  onOpenChange,
  student,
  onSuccess
}: ProgressUpdateDialogProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('')
  const [currentProgress, setCurrentProgress] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<Progress>({
    understanding: 5,
    participation: 5,
    homework: 5,
    notes: ""
  })

  useEffect(() => {
    if (!open) {
      setSelectedSubjectId('')
      setProgress({
        understanding: 5,
        participation: 5,
        homework: 5,
        notes: ""
      })
      setCurrentProgress(null)
    }
  }, [open])

  useEffect(() => {
    if (selectedSubjectId) {
      fetchCurrentProgress()
    }
  }, [selectedSubjectId])

  const fetchCurrentProgress = async () => {
    try {
      const response = await fetch(
        `/api/teacher/students/${student.id}/progress?subjectId=${selectedSubjectId}`
      )
      if (response.ok) {
        const data = await response.json()
        if (data.latestProgress) {
          setCurrentProgress(data.latestProgress)
          setProgress({
            understanding: data.latestProgress.scores.understanding,
            participation: data.latestProgress.scores.participation,
            homework: data.latestProgress.scores.homework,
            notes: data.latestProgress.notes || ""
          })
        } else {
          setCurrentProgress(null)
        }
      }
    } catch (error) {
      console.error('Error fetching progress:', error)
    }
  }

  const handleSubmit = async () => {
    if (!selectedSubjectId) {
      toast.error("Please select a course")
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/teacher/students/${student.id}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...progress,
          subjectId: selectedSubjectId
        })
      })

      if (!response.ok) {
        throw new Error(await response.text())
      }

      // Fetch updated progress immediately after successful update
      await fetchCurrentProgress()
      
      toast.success("Progress updated successfully")
      onSuccess?.()
    } catch (error) {
      console.error('Error updating progress:', error)
      toast.error("Failed to update progress")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Progress - {student?.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label className="text-base">Select Course</Label>
            <div className="mt-2">
              <Select
                value={selectedSubjectId}
                onValueChange={(value) => {
                  setSelectedSubjectId(value)
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a course..." />
                </SelectTrigger>
                <SelectContent>
                  {student?.courses?.filter(c => c.isTeaching).map((course) => (
                    <SelectItem key={course._id} value={course._id}>
                      {course.name} ({course.area})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedSubjectId && (
            <>
              <div className="space-y-6 py-4">
                <div className="space-y-4">
                  <div>
                    <Label>Understanding (1–10)</Label>
                    <Slider
                      value={[progress.understanding]}
                      onValueChange={([value]) =>
                        setProgress(prev => ({ ...prev, understanding: value }))
                      }
                      max={10}
                      min={1}
                      step={1}
                      className="mt-2"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Score: {progress.understanding}
                    </p>
                  </div>

                  <div>
                    <Label>Participation (1–10)</Label>
                    <Slider
                      value={[progress.participation]}
                      onValueChange={([value]) =>
                        setProgress(prev => ({ ...prev, participation: value }))
                      }
                      max={10}
                      min={1}
                      step={1}
                      className="mt-2"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Score: {progress.participation}
                    </p>
                  </div>

                  <div>
                    <Label>Homework Completion (1–10)</Label>
                    <Slider
                      value={[progress.homework]}
                      onValueChange={([value]) =>
                        setProgress(prev => ({ ...prev, homework: value }))
                      }
                      max={10}
                      min={1}
                      step={1}
                      className="mt-2"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Score: {progress.homework}
                    </p>
                  </div>

                  <div>
                    <Label>Notes</Label>
                    <Textarea
                      value={progress.notes}
                      onChange={(e) =>
                        setProgress(prev => ({ ...prev, notes: e.target.value }))
                      }
                      placeholder="Add any notes about the student's progress..."
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>

              {currentProgress && (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Previous Progress</h4>
                  <div className="space-y-2 text-sm">
                    <div>Understanding: {currentProgress.scores.understanding}/10</div>
                    <div>Participation: {currentProgress.scores.participation}/10</div>
                    <div>Homework: {currentProgress.scores.homework}/10</div>
                    <div>Average: {currentProgress.averageScore?.toFixed(1)}</div>
                    <div>Last Updated: {new Date(currentProgress.updatedAt).toLocaleDateString()}</div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !selectedSubjectId}
          >
            {loading ? "Updating..." : "Update Progress"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
