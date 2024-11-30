"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { CalendarEvent, Attendee } from "@/models/event.model"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface EventFormProps {
  date: Date
  onSubmit: (event: Omit<CalendarEvent, "createdBy" | "isSynced" | "_id">) => Promise<void>
  onCancel: () => void
  isLoading: boolean
}

export function EventForm({ date, onSubmit, onCancel, isLoading }: EventFormProps) {
  const [event, setEvent] = useState<Omit<CalendarEvent, "createdBy" | "isSynced" | "_id">>({
    title: "",
    description: "",
    startTime: date.toISOString(),
    endTime: date.toISOString(),
    type: "meeting"
  })
  const [newAttendee, setNewAttendee] = useState('')

  const handleAddAttendee = () => {
    if (newAttendee && /\S+@\S+\.\S+/.test(newAttendee)) {
      setEvent(prev => ({
        ...prev,
        attendees: [...(prev.attendees || []), { email: newAttendee, responseStatus: 'needsAction' }]
      }))
      setNewAttendee('')
    } else {
      toast.error('Please enter a valid email address')
    }
  }

  const handleRemoveAttendee = (email: string) => {
    setEvent(prev => ({
      ...prev,
      attendees: prev.attendees?.filter(a => a.email !== email) || []
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!event.title || !event.startTime || !event.endTime) {
      toast.error('Please fill in all required fields')
      return
    }

    const startDate = new Date(event.startTime)
    const endDate = new Date(event.endTime)

    if (endDate <= startDate) {
      toast.error('End time must be after start time')
      return
    }

    try {
      await onSubmit(event)
      toast.success('Event created successfully')
    } catch (error: any) {
      console.error('Failed to create event:', error)
      toast.error('Failed to create event')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label>Event Type</Label>
          <Select
            value={event.type}
            onValueChange={(value: CalendarEvent['type']) => setEvent(prev => ({ ...prev, type: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select event type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="class">Class</SelectItem>
              <SelectItem value="office-hours">Office Hours</SelectItem>
              <SelectItem value="meeting">Meeting</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Title</Label>
          <Input
            placeholder="Event title"
            value={event.title || ''}
            onChange={(e) => setEvent(prev => ({ ...prev, title: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            placeholder="Event description"
            value={event.description || ''}
            onChange={(e) => setEvent(prev => ({ ...prev, description: e.target.value }))}
            className="h-24"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Start Time</Label>
            <Input
              type="datetime-local"
              value={new Date(event.startTime || '').toISOString().slice(0, 16)}
              onChange={(e) => setEvent(prev => ({ ...prev, startTime: new Date(e.target.value).toISOString() }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>End Time</Label>
            <Input
              type="datetime-local"
              value={new Date(event.endTime || '').toISOString().slice(0, 16)}
              onChange={(e) => setEvent(prev => ({ ...prev, endTime: new Date(e.target.value).toISOString() }))}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Attendees</Label>
          <div className="flex gap-2">
            <Input
              type="email"
              value={newAttendee}
              onChange={(e) => setNewAttendee(e.target.value)}
              placeholder="Enter email address"
            />
            <Button
              type="button"
              onClick={handleAddAttendee}
            >
              Add
            </Button>
          </div>
          {event.attendees && event.attendees.length > 0 && (
            <div className="mt-2 space-y-2">
              {event.attendees.map((attendee) => (
                <div key={attendee.email} className="flex items-center justify-between">
                  <span>{attendee.email}</span>
                  <Button
                    type="button"
                    onClick={() => handleRemoveAttendee(attendee.email)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Recurrence</Label>
          <Select
            value={event.recurrence?.frequency || 'none'}
            onValueChange={(value) => {
              if (value === 'none') {
                setEvent(prev => ({ ...prev, recurrence: undefined }))
              } else {
                type RecurrenceFrequency = NonNullable<CalendarEvent['recurrence']>['frequency']
                setEvent(prev => ({
                  ...prev,
                  recurrence: {
                    frequency: value as RecurrenceFrequency,
                    interval: 1
                  }
                }))
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select recurrence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Recurrence</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {event.recurrence && (
          <>
            <div className="space-y-2">
              <Label>Repeat Every</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  value={event.recurrence.interval || 1}
                  onChange={(e) => setEvent(prev => ({
                    ...prev,
                    recurrence: {
                      ...prev.recurrence!,
                      interval: parseInt(e.target.value)
                    }
                  }))}
                  className="w-20"
                />
                <span>{event.recurrence.frequency === 'daily' ? 'days' :
                       event.recurrence.frequency === 'weekly' ? 'weeks' : 'months'}</span>
              </div>
            </div>

            {event.recurrence.frequency === 'weekly' && (
              <div className="space-y-2">
                <Label>Repeat On</Label>
                <div className="flex gap-2 flex-wrap">
                  {['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'].map((day) => (
                    <Button
                      key={day}
                      type="button"
                      size="sm"
                      variant={event.recurrence?.daysOfWeek?.includes(day) ? 'default' : 'outline'}
                      onClick={() => {
                        const currentDays = event.recurrence?.daysOfWeek || []
                        const newDays = currentDays.includes(day)
                          ? currentDays.filter(d => d !== day)
                          : [...currentDays, day]
                        setEvent(prev => ({
                          ...prev,
                          recurrence: {
                            ...prev.recurrence!,
                            daysOfWeek: newDays
                          }
                        }))
                      }}
                      className={cn(
                        "w-10",
                        event.recurrence?.daysOfWeek?.includes(day) && "bg-primary text-primary-foreground"
                      )}
                    >
                      {day}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={event.recurrence.until || ''}
                onChange={(e) => setEvent(prev => ({
                  ...prev,
                  recurrence: {
                    ...prev.recurrence!,
                    until: e.target.value
                  }
                }))}
              />
            </div>
          </>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading || !event.title || !event.startTime || !event.endTime}
        >
          {isLoading ? 'Creating...' : 'Create Event'}
        </Button>
      </div>
    </form>
  )
}
