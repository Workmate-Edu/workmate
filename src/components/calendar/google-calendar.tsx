"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { GoogleCalendarService } from "@/lib/google-calendar"
import { EventDetailsDialog } from "./event-details-dialog"
import { EventForm } from "./event-form"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { CalendarEvent } from "@/models/event.model"

interface GoogleCalendarProps {
  userId: string
  accessToken: string
}

export function GoogleCalendar({ userId, accessToken }: GoogleCalendarProps) {
  const [date, setDate] = useState<Date>(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showEventForm, setShowEventForm] = useState(false)
  const { data: session } = useSession()

  const calendarService = new GoogleCalendarService({
    userId,
    accessToken
  })

  useEffect(() => {
    if (accessToken) {
      fetchEvents()
    }
  }, [date, accessToken])

  const fetchEvents = async () => {
    try {
      setIsLoading(true)
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)

      const fetchedEvents = await calendarService.getEvents(
        'primary',
        startOfDay,
        endOfDay
      )

      setEvents(fetchedEvents as CalendarEvent[])
    } catch (error: any) {
      console.error('Failed to fetch events:', error)
      toast.error('Failed to fetch events')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateEvent = async (eventData: Partial<CalendarEvent>) => {
    try {
      setIsLoading(true)
      await calendarService.createEvent('primary', {
        ...eventData,
        createdBy: userId,
        isSynced: true
      } as CalendarEvent)
      
      toast.success('Event created successfully')
      setShowEventForm(false)
      fetchEvents()
    } catch (error: any) {
      console.error('Failed to create event:', error)
      toast.error('Failed to create event')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateEvent = async (eventData: Partial<CalendarEvent>) => {
    if (!selectedEvent?._id) return

    try {
      setIsLoading(true)
      await calendarService.updateEvent('primary', {
        ...selectedEvent,
        ...eventData,
        isSynced: true
      })
      
      toast.success('Event updated successfully')
      setSelectedEvent(null)
      fetchEvents()
    } catch (error: any) {
      console.error('Failed to update event:', error)
      toast.error('Failed to update event')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    try {
      setIsLoading(true)
      await calendarService.deleteEvent('primary', eventId)
      
      toast.success('Event deleted successfully')
      setSelectedEvent(null)
      fetchEvents()
    } catch (error: any) {
      console.error('Failed to delete event:', error)
      toast.error('Failed to delete event')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSync = async () => {
    try {
      setIsLoading(true)
      await calendarService.syncEvents('primary')
      
      toast.success('Calendar synced successfully')
      fetchEvents()
    } catch (error: any) {
      console.error('Failed to sync calendar:', error)
      toast.error('Failed to sync calendar')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Calendar</h2>
        <div className="space-x-2">
          <Button
            onClick={() => setShowEventForm(true)}
            disabled={isLoading}
          >
            Create Event
          </Button>
          <Button
            variant="outline"
            onClick={handleSync}
            disabled={isLoading}
          >
            Sync Calendar
          </Button>
        </div>
      </div>

      <Calendar
        mode="single"
        selected={date}
        onSelect={(newDate) => newDate && setDate(newDate)}
        className="rounded-md border"
      />

      <div className="space-y-2">
        {isLoading ? (
          <div>Loading events...</div>
        ) : events.length === 0 ? (
          <div>No events for this day</div>
        ) : (
          events.map((event) => (
            <div
              key={event._id}
              onClick={() => setSelectedEvent(event)}
              className={cn(
                "p-4 rounded-lg border cursor-pointer hover:bg-accent",
                event.type === 'class' && "border-blue-500",
                event.type === 'office-hours' && "border-green-500",
                event.type === 'meeting' && "border-purple-500"
              )}
            >
              <div className="font-medium">{event.title}</div>
              <div className="text-sm text-muted-foreground">
                {new Date(event.startTime).toLocaleTimeString()} - {new Date(event.endTime).toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
      </div>

      {showEventForm && (
        <EventForm
          date={date}
          onSubmit={handleCreateEvent}
          onCancel={() => setShowEventForm(false)}
          isLoading={isLoading}
        />
      )}

      {selectedEvent && (
        <EventDetailsDialog
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onUpdate={handleUpdateEvent}
          onDelete={handleDeleteEvent}
          isLoading={isLoading}
          // Add any additional props here
        />
      )}
    </div>
  )
}
