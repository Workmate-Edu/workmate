"use client"

import { useState } from "react"
import { AlertCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { addWeeks, addDays, format, differenceInDays, getDay } from "date-fns"

interface StartClassDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  courseId: string
  courseName: string
  students: Array<{ id: string; name: string }>
  onSuccess?: () => void
}

const GOOGLE_MEET_MAX_DAYS = 90

const DAYS = [
  { short: 'Sun', long: 'Sunday', value: 0 },
  { short: 'Mon', long: 'Monday', value: 1 },
  { short: 'Tue', long: 'Tuesday', value: 2 },
  { short: 'Wed', long: 'Wednesday', value: 3 },
  { short: 'Thu', long: 'Thursday', value: 4 },
  { short: 'Fri', long: 'Friday', value: 5 },
  { short: 'Sat', long: 'Saturday', value: 6 }
]

// Add date validation helpers
const getTodayDateTime = () => {
  const now = new Date()
  // Format: YYYY-MM-DDTHH:mm
  return format(now, "yyyy-MM-dd'T'HH:mm")
}

const getTomorrowDate = () => {
  const tomorrow = addDays(new Date(), 1)
  // Format: YYYY-MM-DD
  return format(tomorrow, 'yyyy-MM-dd')
}

export function StartClassDialog({
  open,
  onOpenChange,
  courseId,
  courseName,
  students,
  onSuccess
}: StartClassDialogProps) {
  const [formData, setFormData] = useState({
    dateTime: "",
    duration: "60",
    selectedStudents: [],
    externalLink: "",
    useCustomLink: false,
    recurrence: {
      type: 'none',
      daysOfWeek: [],
      endsOn: ''
    }
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    // Validate duration
    const duration = parseInt(formData.duration)
    if (isNaN(duration) || duration < 30 || duration > 180) {
      newErrors.duration = "Duration must be between 30 and 180 minutes"
    }

    // Validate recurrence
    if (formData.recurrence.type !== 'none') {
      if (!formData.recurrence.endsOn) {
        newErrors.recurrence = "Please select an end date"
      } else {
        const endDate = new Date(formData.recurrence.endsOn)
        const startDate = new Date(formData.dateTime)
        
        if (isNaN(endDate.getTime())) {
          newErrors.recurrence = "Invalid end date"
        } else if (endDate <= startDate) {
          newErrors.recurrence = "End date must be after start date"
        }
      }

      // Validate selected days for weekly/twice-weekly
      if (['weekly', 'twice-weekly'].includes(formData.recurrence.type) && 
          formData.recurrence.daysOfWeek.length === 0) {
        newErrors.recurrence = "Please select at least one day"
      }
    }

    if (formData.selectedStudents.length === 0) {
      newErrors.students = "Please select at least one student"
    }

    if (formData.useCustomLink && !formData.externalLink) {
      newErrors.externalLink = "Please provide a meeting link"
    }

    const recurrenceErrors = validateRecurrence(formData)
    return { ...newErrors, ...recurrenceErrors }
  }

  const validateRecurrence = (data: typeof formData) => {
    const errors: { [key: string]: string } = {}
    
    if (data.recurrence.type !== 'none') {
      const endDate = new Date(data.recurrence.endsOn)
      const startDate = new Date(data.dateTime)
      const daysDifference = differenceInDays(endDate, startDate)

      if (daysDifference > GOOGLE_MEET_MAX_DAYS) {
        errors.recurrence = `Google Meet links expire after ${GOOGLE_MEET_MAX_DAYS} days. Please schedule sessions within this limit.`
      }
    }

    return errors
  }

  const handleInputChange = (field: string, value: any) => {
    console.log(`Updating ${field}:`, value)
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
      console.log('Updated form data:', newData)
      return newData
    })
    setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  const handleStudentSelection = (studentId: string) => {
    console.log('Toggling student selection:', studentId)
    setFormData(prev => {
      const newSelectedStudents = prev.selectedStudents.includes(studentId)
        ? prev.selectedStudents.filter(id => id !== studentId)
        : [...prev.selectedStudents, studentId]
      
      console.log('Updated selected students:', newSelectedStudents)
      
      return {
        ...prev,
        selectedStudents: newSelectedStudents
      }
    })
    setErrors(prev => ({ ...prev, students: undefined }))
  }

  const handleRecurrenceChange = (type: string) => {
    console.log('Updating recurrence type:', type)
    const recurrence = {
      ...formData.recurrence,
      type,
      isRecurring: type !== 'none'
    }
    console.log('New recurrence data:', recurrence)
    handleInputChange('recurrence', recurrence)
  }

  const handleDaySelection = (dayIndex: number) => {
    console.log('Toggling day:', DAYS[dayIndex].long)
    const days = formData.recurrence.daysOfWeek.includes(dayIndex)
      ? formData.recurrence.daysOfWeek.filter(d => d !== dayIndex)
      : [...formData.recurrence.daysOfWeek, dayIndex]
    
    const recurrence = {
      ...formData.recurrence,
      daysOfWeek: days.sort((a, b) => a - b)
    }
    console.log('Updated schedule:', {
      days: days.map(d => DAYS[d].long),
      pattern: recurrence.type
    })
    handleInputChange('recurrence', recurrence)
  }

  const formatRecurrenceInfo = (data: typeof formData) => {
    const { recurrence } = data
    if (recurrence.type === 'none') return null

    try {
      const startDate = new Date(data.dateTime)
      const endDate = recurrence.endsOn ? new Date(recurrence.endsOn) : null
      const selectedDays = recurrence.daysOfWeek
        .map(day => DAYS[day].long)
        .join(' and ')

      return {
        frequency: recurrence.type,
        days: selectedDays,
        startDate: startDate ? format(startDate, 'PPP') : '',
        endDate: endDate ? format(endDate, 'PPP') : '',
        time: startDate ? format(startDate, 'p') : '',
      }
    } catch (error) {
      console.error('Date formatting error:', error)
      return null
    }
  }

  const getMaxEndDate = () => {
    if (!formData.dateTime) {
      return format(addDays(new Date(), GOOGLE_MEET_MAX_DAYS), 'yyyy-MM-dd')
    }
    const startDate = new Date(formData.dateTime)
    return format(
      isNaN(startDate.getTime()) 
        ? addDays(new Date(), GOOGLE_MEET_MAX_DAYS)
        : addDays(startDate, GOOGLE_MEET_MAX_DAYS),
      'yyyy-MM-dd'
    )
  }

  const validateDates = () => {
    const errors: { [key: string]: string } = {}
    const now = new Date()

    // Validate session date/time
    if (formData.dateTime) {
      const sessionDate = new Date(formData.dateTime)
      if (sessionDate < now) {
        errors.dateTime = "Session cannot be scheduled in the past"
      }
    }

    // Validate recurrence end date
    if (formData.recurrence.type !== 'none' && formData.recurrence.endsOn) {
      const endDate = new Date(formData.recurrence.endsOn)
      const sessionDate = new Date(formData.dateTime)
      
      if (endDate < sessionDate) {
        errors.recurrence = "End date must be after session start date"
      }
    }

    return errors
  }

  const handleSubmit = async () => {
    const dateErrors = validateDates()
    if (Object.keys(dateErrors).length > 0) {
      // Show first error message
      toast.error(Object.values(dateErrors)[0])
      return
    }

    const validationErrors = validateForm()
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      toast.error(Object.values(validationErrors).join('\n'))
      return
    }

    const recurrenceInfo = formatRecurrenceInfo(formData)
    console.log('Session schedule:', recurrenceInfo)

    const submissionData = {
      courseId,
      startTime: formData.dateTime,
      duration: parseInt(formData.duration),
      students: formData.selectedStudents,
      externalLink: formData.useCustomLink ? formData.externalLink : undefined,
      recurrence: {
        pattern: formData.recurrence.type,
        daysOfWeek: formData.recurrence.daysOfWeek,
        endsOn: formData.recurrence.endsOn,
        isRecurring: formData.recurrence.type !== 'none',
        schedule: recurrenceInfo // Add formatted schedule info
      }
    }

    console.log('Final submission data:', submissionData)

    try {
      setLoading(true)
      const response = await fetch("/api/teacher/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Session creation failed:', errorData)
        throw new Error(errorData.error || "Failed to create session")
      }
      
      const data = await response.json()
      console.log('Session created successfully:', data)
      
      toast.success("Session created successfully")
      onOpenChange(false)
      onSuccess?.()

    } catch (error) {
      console.error('Session creation error:', error)
      toast.error("Failed to create class session")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="sticky top-0 z-30 bg-background pt-4 pb-2">
          <DialogTitle>Schedule Class Session</DialogTitle>
          <DialogDescription>
            Create a new class session for {courseName}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-6">
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label>Date and Time*</Label>
              <Input
                type="datetime-local"
                value={formData.dateTime}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  dateTime: e.target.value
                }))}
                min={getTodayDateTime()} // Add minimum date/time
              />
              {errors.dateTime && (
                <p className="text-sm text-destructive">{errors.dateTime}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Click the calendar icon to select date and time
              </p>
            </div>

            <div className="grid gap-2">
              <Label>Duration (minutes)*</Label>
              <Input
                type="number"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                min="30"
                max="180"
              />
              {errors.duration && (
                <p className="text-sm text-destructive">{errors.duration}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Session duration between 30-180 minutes
              </p>
            </div>

            <div className="grid gap-2">
              <Label>Select Students* ({formData.selectedStudents.length} selected)</Label>
              <div className="border rounded-md p-4 space-y-2 max-h-[200px] overflow-y-auto">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={student.id}
                      checked={formData.selectedStudents.includes(student.id)}
                      onCheckedChange={() => handleStudentSelection(student.id)}
                    />
                    <label
                      htmlFor={student.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {student.name}
                    </label>
                  </div>
                ))}
              </div>
              {errors.students && (
                <p className="text-sm text-destructive">{errors.students}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="useCustomLink"
                checked={formData.useCustomLink}
                onCheckedChange={(checked) => 
                  handleInputChange('useCustomLink', checked)
                }
              />
              <Label htmlFor="useCustomLink">Use custom meeting link</Label>
            </div>

            {formData.useCustomLink && (
              <div className="grid gap-2">
                <Label>Custom Meeting Link*</Label>
                <Input
                  type="url"
                  placeholder="https://meet.google.com/..."
                  value={formData.externalLink}
                  onChange={(e) => handleInputChange('externalLink', e.target.value)}
                />
                {errors.externalLink && (
                  <p className="text-sm text-destructive">{errors.externalLink}</p>
                )}
              </div>
            )}

            <div className="space-y-4">
              <Label>Recurrence (Optional)</Label>
              <RadioGroup
                value={formData.recurrence.type}
                onValueChange={handleRecurrenceChange}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="none" />
                  <Label htmlFor="none">One-time session</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="daily" id="daily" />
                  <Label htmlFor="daily">Daily</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="weekly" id="weekly" />
                  <Label htmlFor="weekly">Weekly</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="multiple-days" id="multiple-days" />
                  <Label htmlFor="multiple-days">Multiple Days Per Week</Label>
                </div>
              </RadioGroup>

              {formData.recurrence.type !== 'none' && (
                <div className="space-y-4">
                  {(formData.recurrence.type === 'weekly' || formData.recurrence.type === 'multiple-days') && (
                    <div className="space-y-2">
                      <Label>Select Days</Label>
                      <div className="flex gap-2">
                        {DAYS.map((day) => (
                          <Button
                            key={day.short}
                            type="button"
                            variant={formData.recurrence.daysOfWeek.includes(day.value) ? "default" : "outline"}
                            className="w-12"
                            onClick={() => handleDaySelection(day.value)}
                            title={day.long}
                          >
                            {day.short}
                          </Button>
                        ))}
                      </div>
                      {formData.recurrence.type === 'multiple-days' && (
                        <p className="text-sm text-muted-foreground">
                          Select the days you want to hold sessions each week
                        </p>
                      )}
                    </div>
                  )}

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
                      min={getTomorrowDate()} // Add minimum end date
                    />
                  </div>
                </div>
              )}
            </div>

            {formData.recurrence.type !== 'none' && formData.recurrence.daysOfWeek.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Sessions will be held every {formData.recurrence.daysOfWeek
                  .map(d => DAYS[d].long)
                  .join(' and ')}
              </p>
            )}

            {formData.recurrence.type !== 'none' && (
              <div className="rounded-md bg-yellow-50 p-4 mt-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Google Meet Limitation
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        Google Meet links expire after {GOOGLE_MEET_MAX_DAYS} days. 
                        For sessions beyond this period, you'll need to create new sessions 
                        or use a different meeting platform.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="sticky bottom-0 z-30 bg-background pt-2 pb-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Session"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function calculateTotalSessions(startDate: Date, recurrence: any) {
  const totalDays = differenceInDays(new Date(recurrence.endsOn), startDate) + 1
  const totalWeeks = Math.ceil(totalDays / 7)

  switch (recurrence.pattern) {
    case 'daily':
      return totalDays
    case 'weekly':
      return totalWeeks
    case 'multiple-days':
      // Count actual occurrences based on selected days
      if (recurrence.daysOfWeek?.length) {
        return totalWeeks * recurrence.daysOfWeek.length
      }
      return totalWeeks
    case 'bi-weekly':
      return Math.ceil(totalWeeks / 2)
    default:
      return 1
  }
}
