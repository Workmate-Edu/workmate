"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { CalendarEvent } from "@/lib/google-calendar"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface EventFormProps {
  date: Date
  onSubmit: (event: CalendarEvent) => Promise<void>
  onCancel: () => void
  isLoading: boolean
}

export function EventForm({ date, onSubmit, onCancel, isLoading }: EventFormProps) {
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    type: 'class',
    startTime: '',
    endTime: '',
  })

  const [attendees, setAttendees] = useState<string[]>([]);
  const [newAttendee, setNewAttendee] = useState('');

  const generateMeetLink = () => {
    const roomId = `workmate-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    return `https://meet.jit.si/${roomId}`;
  }

  const handleAddAttendee = () => {
    if (newAttendee && /\S+@\S+\.\S+/.test(newAttendee)) {
      setAttendees([...attendees, newAttendee]);
      setNewAttendee('');
    }
  };

  const handleRemoveAttendee = (email: string) => {
    setAttendees(attendees.filter(a => a !== email));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEvent.title || !newEvent.startTime || !newEvent.endTime) {
      toast.error('Please fill in all required fields')
      return
    }

    const [startHour, startMinute] = newEvent.startTime.split(':')
    const [endHour, endMinute] = newEvent.endTime.split(':')
    
    const startDate = new Date(date)
    startDate.setHours(parseInt(startHour), parseInt(startMinute), 0)
    
    const endDate = new Date(date)
    endDate.setHours(parseInt(endHour), parseInt(endMinute), 0)

    if (endDate <= startDate) {
      toast.error('End time must be after start time')
      return
    }

    const eventData: CalendarEvent = {
      title: newEvent.title,
      description: newEvent.description,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      type: newEvent.type as CalendarEvent['type'],
      recurrence: newEvent.recurrence,
      meetLink: generateMeetLink(),
      attendees: attendees
    }

    try {
      await onSubmit(eventData)
      toast.success('Event created successfully')
    } catch (error: any) {
      if (error.message?.includes('rate limit')) {
        toast.error('Too many requests. Please wait a moment and try again.')
      } else {
        toast.error(error.message || 'Failed to create event')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label>Event Type</Label>
          <Select
            value={newEvent.type}
            onValueChange={(value) => setNewEvent(prev => ({ ...prev, type: value }))}
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
            value={newEvent.title || ''}
            onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            placeholder="Event description"
            value={newEvent.description || ''}
            onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
            className="h-24"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Start Time</Label>
            <Input
              type="time"
              value={newEvent.startTime}
              onChange={(e) => setNewEvent(prev => ({ ...prev, startTime: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>End Time</Label>
            <Input
              type="time"
              value={newEvent.endTime}
              onChange={(e) => setNewEvent(prev => ({ ...prev, endTime: e.target.value }))}
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
          {attendees.length > 0 && (
            <div className="mt-2 space-y-2">
              {attendees.map((email) => (
                <div key={email} className="flex items-center justify-between">
                  <span>{email}</span>
                  <Button
                    type="button"
                    onClick={() => handleRemoveAttendee(email)}
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
            value={newEvent.recurrence?.frequency || 'none'}
            onValueChange={(value) => {
              if (value === 'none') {
                const { recurrence, ...rest } = newEvent
                setNewEvent(rest)
              } else {
                setNewEvent(prev => ({
                  ...prev,
                  recurrence: {
                    frequency: value as CalendarEvent['recurrence']['frequency'],
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
            </SelectContent>
          </Select>
        </div>

        {newEvent.recurrence && (
          <>
            <div className="space-y-2">
              <Label>Repeat Every</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  value={newEvent.recurrence.interval || 1}
                  onChange={(e) => setNewEvent(prev => ({
                    ...prev,
                    recurrence: {
                      ...prev.recurrence!,
                      interval: parseInt(e.target.value)
                    }
                  }))}
                  className="w-20"
                />
                <span>{newEvent.recurrence.frequency === 'daily' ? 'days' :
                       newEvent.recurrence.frequency === 'weekly' ? 'weeks' : 'months'}</span>
              </div>
            </div>

            {newEvent.recurrence.frequency === 'weekly' && (
              <div className="space-y-2">
                <Label>Repeat On</Label>
                <div className="flex gap-2 flex-wrap">
                  {['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'].map((day) => (
                    <Button
                      key={day}
                      type="button"
                      size="sm"
                      variant={newEvent.recurrence?.daysOfWeek?.includes(day) ? 'default' : 'outline'}
                      onClick={() => {
                        const currentDays = newEvent.recurrence?.daysOfWeek || []
                        const newDays = currentDays.includes(day)
                          ? currentDays.filter(d => d !== day)
                          : [...currentDays, day]
                        setNewEvent(prev => ({
                          ...prev,
                          recurrence: {
                            ...prev.recurrence!,
                            daysOfWeek: newDays
                          }
                        }))
                      }}
                      className={cn(
                        "w-10",
                        newEvent.recurrence?.daysOfWeek?.includes(day) && "bg-primary text-primary-foreground"
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
                value={newEvent.recurrence.until || ''}
                onChange={(e) => setNewEvent(prev => ({
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
          disabled={isLoading || !newEvent.title || !newEvent.startTime || !newEvent.endTime}
        >
          {isLoading ? 'Creating...' : 'Create Event'}
        </Button>
      </div>
    </form>
  )
}
