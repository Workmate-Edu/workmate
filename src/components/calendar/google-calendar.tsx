"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EventForm } from "./event-form"
import { toast } from "sonner"
import type { CalendarEvent } from "@/lib/google-calendar"
import { format } from "date-fns"

export function GoogleCalendar() {
  const [date, setDate] = useState<Date>(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isCreatingEvent, setIsCreatingEvent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchEvents()
  }, [date])

  const fetchEvents = async () => {
    if (!date) return

    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    try {
      const response = await fetch(
        `/api/calendar?timeMin=${startOfDay.toISOString()}&timeMax=${endOfDay.toISOString()}`
      )
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Failed to fetch events:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        })
        
        if (response.status === 401) {
          toast.error('Please sign in with Google to access your calendar')
          return
        }
        
        toast.error(errorText || 'Failed to load events')
        return
      }

      const data = await response.json()
      setEvents(data)
    } catch (error) {
      console.error('Error fetching events:', error)
      toast.error('Failed to load events. Please try again later.')
    }
  }

  const handleCreateEvent = async (eventData: CalendarEvent) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText)
      }
      
      const createdEvent = await response.json()
      setEvents(prev => [...prev, createdEvent])
      setIsCreatingEvent(false)
      toast.success('Event created successfully')
    } catch (error: any) {
      console.error('Error creating event:', error)
      toast.error(error.message || 'Failed to create event')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Calendar</h2>
        <Button onClick={() => setIsCreatingEvent(true)}>Add Event</Button>
      </div>

      <div className="grid lg:grid-cols-[300px,1fr] gap-8">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(date) => date && setDate(date)}
          className="rounded-md border shadow"
        />

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Events for {format(date, 'MMMM d, yyyy')}
          </h3>
          
          {events.length === 0 ? (
            <p className="text-muted-foreground">No events scheduled for this day.</p>
          ) : (
            <div className="space-y-2">
              {events.map((event) => (
                <div
                  key={event.id}
                  className={cn(
                    "p-4 rounded-lg border",
                    event.type === 'class' && "bg-blue-50 border-blue-200",
                    event.type === 'office-hours' && "bg-green-50 border-green-200",
                    event.type === 'meeting' && "bg-purple-50 border-purple-200"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      {event.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {event.description}
                        </p>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(event.startTime), 'h:mm a')} - {format(new Date(event.endTime), 'h:mm a')}
                    </span>
                  </div>
                  {event.recurrence && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      Repeats {event.recurrence.frequency}
                      {event.recurrence.interval > 1 && ` every ${event.recurrence.interval} ${event.recurrence.frequency}s`}
                      {event.recurrence.daysOfWeek && ` on ${event.recurrence.daysOfWeek.join(', ')}`}
                      {event.recurrence.until && ` until ${format(new Date(event.recurrence.until), 'MMM d, yyyy')}`}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={isCreatingEvent} onOpenChange={setIsCreatingEvent}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
          </DialogHeader>
          <EventForm
            date={date}
            onSubmit={handleCreateEvent}
            onCancel={() => setIsCreatingEvent(false)}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
