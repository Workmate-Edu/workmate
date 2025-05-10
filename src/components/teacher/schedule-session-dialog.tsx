"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { addDays, format } from "date-fns"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

interface Subject {
  id: string;
  name: string;
  area: string;
  students: Array<{
    id: string;
    name: string;
    email: string;
    grade?: string;
  }>;
}

interface ScheduleSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: Array<Subject>;
  onSuccess: () => void;
}

export function ScheduleSessionDialog({
  open,
  onOpenChange,
  subjects,
  onSuccess
}: ScheduleSessionDialogProps) {
  const [selectedSubject, setSelectedSubject] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [formData, setFormData] = React.useState({
    dateTime: "",
    duration: "60",
    externalLink: "",
    useCustomLink: false,
    recurrence: {
      type: 'none',
      daysOfWeek: [] as number[],
      endsOn: ''
    }
  })

  // Add state for selected students
  const [selectedStudents, setSelectedStudents] = React.useState<string[]>([])

  const DAYS = [
    { short: 'Sun', long: 'Sunday', value: 0 },
    { short: 'Mon', long: 'Monday', value: 1 },
    { short: 'Tue', long: 'Tuesday', value: 2 },
    { short: 'Wed', long: 'Wednesday', value: 3 },
    { short: 'Thu', long: 'Thursday', value: 4 },
    { short: 'Fri', long: 'Friday', value: 5 },
    { short: 'Sat', long: 'Saturday', value: 6 }
  ]

  // Get current subject's students
  const currentSubject = subjects.find(s => s.id === selectedSubject)

  // Reset selected students when subject changes
  React.useEffect(() => {
    setSelectedStudents([])
  }, [selectedSubject])

  const handleSubmit = async () => {
    if (!selectedSubject) {
      toast.error("Please select a subject")
      return
    }

    if (selectedStudents.length === 0) {
      toast.error("Please select at least one student")
      return
    }

    if (!formData.dateTime) {
      toast.error("Please select date and time")
      return
    }

    try {
      setLoading(true)
      const response = await fetch("/api/teacher/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: selectedSubject,
          startTime: formData.dateTime,
          duration: parseInt(formData.duration),
          externalLink: formData.useCustomLink ? formData.externalLink : undefined,
          recurrence: formData.recurrence.type !== 'none' ? {
            isRecurring: true,
            pattern: formData.recurrence.type,
            daysOfWeek: formData.recurrence.daysOfWeek,
            endsOn: formData.recurrence.endsOn
          } : undefined,
          students: selectedStudents // Include selected students in the request
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create session")
      }

      toast.success("Session scheduled successfully")
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to schedule session:", error)
      toast.error("Failed to schedule session")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Schedule New Session</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label>Subject*</Label>
            <Select
              value={selectedSubject}
              onValueChange={setSelectedSubject}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem 
                    key={subject.id} 
                    value={subject.id}
                  >
                    {subject.name} ({subject.area}) - {subject.students.length} students
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {currentSubject && (
            <div className="space-y-2">
              <Label>Select Students*</Label>
              <div className="border rounded-md p-4 space-y-2 max-h-[200px] overflow-y-auto">
                {currentSubject.students.map((student) => (
                  <div key={student.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={student.id}
                      checked={selectedStudents.includes(student.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedStudents(prev => [...prev, student.id])
                        } else {
                          setSelectedStudents(prev => prev.filter(id => id !== student.id))
                        }
                      }}
                    />
                    <Label htmlFor={student.id} className="text-sm">
                      {student.name} {student.grade ? `(Grade ${student.grade})` : ''}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Date and Time*</Label>
            <Input
              type="datetime-local"
              value={formData.dateTime}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                dateTime: e.target.value
              }))}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          <div className="space-y-2">
            <Label>Duration (minutes)*</Label>
            <Input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                duration: e.target.value
              }))}
              min="30"
              max="180"
            />
            <p className="text-sm text-muted-foreground">
              Session duration between 30-180 minutes
            </p>
          </div>

          <div className="space-y-4">
            <Label>Recurrence</Label>
            <RadioGroup
              value={formData.recurrence.type}
              onValueChange={(value) => setFormData(prev => ({
                ...prev,
                recurrence: {
                  ...prev.recurrence,
                  type: value
                }
              }))}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="none" />
                <Label htmlFor="none">One-time session</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="weekly" id="weekly" />
                <Label htmlFor="weekly">Weekly</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="twice-weekly" id="twice-weekly" />
                <Label htmlFor="twice-weekly">Multiple times a week</Label>
              </div>
            </RadioGroup>

            {formData.recurrence.type !== 'none' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Days</Label>
                  <div className="flex gap-2 flex-wrap">
                    {DAYS.map((day) => (
                      <Button
                        key={day.value}
                        type="button"
                        variant={formData.recurrence.daysOfWeek.includes(day.value) 
                          ? "default" 
                          : "outline"
                        }
                        className="w-12"
                        onClick={() => {
                          const days = formData.recurrence.daysOfWeek.includes(day.value)
                            ? formData.recurrence.daysOfWeek.filter(d => d !== day.value)
                            : [...formData.recurrence.daysOfWeek, day.value]
                          setFormData(prev => ({
                            ...prev,
                            recurrence: {
                              ...prev.recurrence,
                              daysOfWeek: days.sort()
                            }
                          }))
                        }}
                      >
                        {day.short}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Ends On</Label>
                  <Input
                    type="date"
                    value={formData.recurrence.endsOn}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      recurrence: {
                        ...prev.recurrence,
                        endsOn: e.target.value
                      }
                    }))}
                    min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="useCustomLink"
              checked={formData.useCustomLink}
              onCheckedChange={(checked) => setFormData(prev => ({
                ...prev,
                useCustomLink: checked as boolean
              }))}
            />
            <Label htmlFor="useCustomLink">Use custom meeting link</Label>
          </div>

          {formData.useCustomLink && (
            <div className="space-y-2">
              <Label>Meeting Link</Label>
              <Input
                type="url"
                placeholder="https://meet.google.com/..."
                value={formData.externalLink}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  externalLink: e.target.value
                }))}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Scheduling..." : "Schedule Session"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
