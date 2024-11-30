"use client"

import { useState, useEffect, useCallback } from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { EventForm } from "./event-form"
import { EventDetailsDialog } from './event-details-dialog';
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { CalendarEvent } from "@/models/event.model"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useSession } from "next-auth/react"
import { signIn } from "next-auth/react"
import { Check, Cloud, Chrome, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Copy, Video } from "lucide-react"
import { JitsiMeetingDialog } from "@/components/meeting/jitsi-meeting"

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function ScheduleCalendar() {
  const { data: session, status } = useSession()
  const [date, setDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isCreatingEvent, setIsCreatingEvent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showGoogleAuthPrompt, setShowGoogleAuthPrompt] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'synced' | 'unsynced' | 'syncing'>('unsynced')
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showEventDetails, setShowEventDetails] = useState(false)
  const [showMeeting, setShowMeeting] = useState(false)
  const [showConnectGoogle, setShowConnectGoogle] = useState(false);

  // Get all days in current month
  const monthStart = startOfMonth(date)
  const monthEnd = endOfMonth(date)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Fetch events from our database
  const fetchEvents = useCallback(async () => {
    if (status === 'loading') return
    if (!session?.user?.id) {
      setEvents([])
      return
    }

    try {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)

      const response = await fetch(
        `/api/events?startTime=${startOfDay.toISOString()}&endTime=${endOfDay.toISOString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        if (response.status === 401) return
        throw new Error('Failed to fetch events')
      }

      const data = await response.json()
      setEvents(data)
      
      // Update sync status based on events
      const hasUnsyncedEvents = data.some((event: any) => !event.isSynced)
      setSyncStatus(hasUnsyncedEvents ? 'unsynced' : 'synced')
    } catch (error: any) {
      console.error('Error fetching events:', error)
      setEvents([])
    }
  }, [date, session, status])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const handleCreateEvent = () => {
    if (!session?.user?.accessToken) {
      setShowConnectGoogle(true);
      return;
    }
    setIsCreatingEvent(true);
  };

  const handleConnectGoogle = () => {
    // Get current URL path (e.g., /dashboard/student/calendar)
    const currentPath = window.location.pathname;
    
    signIn('google', {
      callbackUrl: currentPath,
      prompt: 'consent',
      scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events'
    });
  };

  // Handle event creation
  const handleCreateEventSubmit = async (eventData: Omit<CalendarEvent, 'createdBy' | 'isSynced'>) => {
    setIsLoading(true);
    try {
      console.log('Submitting event data:', eventData);
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...eventData,
          createdBy: session?.user?.id,
          isSynced: false
        }),
      });

      if (!response.ok) throw new Error('Failed to create event');
      
      toast.success('Event created successfully!');
      setIsCreatingEvent(false);
      fetchEvents();

      // Show sync suggestion toast if not synced with Google
      if (!session?.user?.accessToken) {
        console.log('No Google access token, suggesting sync');
        toast.message('Want to sync with Google Calendar?', {
          action: {
            label: 'Connect Google',
            onClick: () => {
              const currentPath = window.location.pathname + window.location.search;
              console.log('Initiating Google sign-in with callback:', currentPath);
              signIn('google', {
                callbackUrl: currentPath,
                prompt: 'consent',
                scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly'
              });
            }
          }
        });
      }
    } catch (error: any) {
      console.error('Event creation failed:', error);
      toast.error('Failed to create event');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sync with Google Calendar
  const handleSyncClick = () => {
    if (!session?.user?.accessToken) {
      const currentPath = window.location.pathname + window.location.search;
      console.log('Initiating Google sign-in for sync');
      signIn('google', {
        callbackUrl: currentPath,
        prompt: 'consent',
        scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly'
      });
      return;
    }
    console.log('Starting sync with access token');
    syncEvents();
  };

  const syncEvents = async () => {
    setSyncStatus('syncing')
    try {
      const response = await fetch('/api/calendar/sync', {
        method: 'POST'
      })

      if (!response.ok) throw new Error('Sync failed')
      
      const { synced, failed } = await response.json()
      
      if (failed > 0) {
        toast.error(`${failed} events failed to sync`)
      }
      if (synced > 0) {
        toast.success(`${synced} events synced to Google Calendar`)
      }
      
      fetchEvents() // Refresh to update sync status
    } catch (error) {
      toast.error('Failed to sync with Google Calendar')
      setSyncStatus('unsynced')
    }
  }

  const hasEvents = (day: Date) => {
    return events.some(event => {
      const eventDate = new Date(event.startTime)
      return eventDate.getDate() === day.getDate() &&
             eventDate.getMonth() === day.getMonth() &&
             eventDate.getFullYear() === day.getFullYear()
    })
  }

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setShowEventDetails(true)
  }

  // Get meeting room name from URL
  const getRoomName = (meetLink: string) => {
    try {
      return new URL(meetLink).pathname.slice(1)
    } catch {
      return meetLink
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete event');
      
      toast.success('Event deleted successfully!');
      setShowEventDetails(false);
      setSelectedEvent(null);
      fetchEvents();
    } catch (error: any) {
      console.error('Event deletion failed:', error);
      toast.error('Failed to delete event');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {showConnectGoogle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Connect Google Calendar</h3>
            <p className="text-gray-600 mb-4">
              To create events with meeting links and automatic invitations, you need to connect your Google Calendar.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowConnectGoogle(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConnectGoogle}
              >
                Connect Google Calendar
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Event Creation Dialog */}
      {isCreatingEvent && (
        <Dialog open={isCreatingEvent} onOpenChange={setIsCreatingEvent}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
            </DialogHeader>
            <EventForm
              date={date}
              onSubmit={handleCreateEventSubmit}
              onCancel={() => setIsCreatingEvent(false)}
              isLoading={isLoading}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Event Details Dialog */}
      {showEventDetails && (
        <EventDetailsDialog
          event={selectedEvent}
          onClose={() => {
            setShowEventDetails(false);
            setSelectedEvent(null);
          }}
          onDelete={selectedEvent?._id ? async () => await handleDeleteEvent(selectedEvent._id!) : undefined}
        />
      )}

      {/* Calendar Grid */}
      <Card className="p-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setDate(addMonths(date, -1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold">
              {format(date, 'MMMM yyyy')}
            </h2>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setDate(addMonths(date, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Sync Status Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncClick}
              className={cn(
                "flex items-center gap-2",
                syncStatus === 'syncing' && "animate-pulse",
                syncStatus === 'synced' && "text-green-600",
                syncStatus === 'unsynced' && "text-yellow-600"
              )}
            >
              {syncStatus === 'syncing' && (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Syncing...
                </>
              )}
              {syncStatus === 'synced' && (
                <>
                  <Check className="h-4 w-4" />
                  Synced
                </>
              )}
              {syncStatus === 'unsynced' && (
                <>
                  <Cloud className="h-4 w-4" />
                  Sync to Google
                </>
              )}
            </Button>

            {/* Create Event Button */}
            <Button onClick={handleCreateEvent}>
              Create Event
            </Button>
          </div>
        </div>

        {/* Calendar Days */}
        <div className="border rounded-lg">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-px border-b bg-muted">
            {WEEKDAYS.map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-px">
            {days.map((day) => {
              const dayHasEvents = hasEvents(day)
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setDate(day)}
                  className={cn(
                    "h-12 relative hover:bg-accent hover:text-accent-foreground focus:z-10 focus:outline-none",
                    isSameMonth(day, date) ? "bg-background" : "bg-muted/50 text-muted-foreground",
                    isToday(day) && "font-semibold text-primary",
                    date.getDate() === day.getDate() && isSameMonth(day, date) && "bg-accent text-accent-foreground"
                  )}
                >
                  <time
                    dateTime={format(day, 'yyyy-MM-dd')}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    {format(day, 'd')}
                  </time>
                  {dayHasEvents && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
                      <div className="h-1 w-1 rounded-full bg-primary" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Events List */}
        <div className="space-y-4">
          <h3 className="font-medium text-lg">
            Events for {format(date, 'MMMM d, yyyy')}
          </h3>
          {events.length === 0 ? (
            <p className="text-muted-foreground">
              No events scheduled for this day.
            </p>
          ) : (
            <div className="space-y-2">
              {events
                .filter(event => {
                  const eventDate = new Date(event.startTime)
                  return eventDate.getDate() === date.getDate() &&
                         eventDate.getMonth() === date.getMonth() &&
                         eventDate.getFullYear() === date.getFullYear()
                })
                .map((event, eventIndex) => (
                  <Button
                    key={eventIndex}
                    variant="ghost"
                    className={cn(
                      "w-full text-left font-normal",
                      "hover:bg-muted/50",
                      "flex items-center gap-2 overflow-hidden"
                    )}
                    onClick={() => handleEventClick(event)}
                  >
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    <div className="flex-grow min-w-0">
                      <div className="truncate">{event.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(event.startTime), 'h:mm a')}
                      </div>
                    </div>
                    {event.meetLink && (
                      <Video className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                    )}
                  </Button>
                ))}
            </div>
          )}
        </div>

        {/* Google Calendar Connection Dialog */}
        <Dialog open={showGoogleAuthPrompt} onOpenChange={setShowGoogleAuthPrompt}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Connect Google Calendar</DialogTitle>
              <DialogDescription>
                Sync your events with Google Calendar to:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Automatically create Google Meet links</li>
                  <li>Send calendar invitations to attendees</li>
                  <li>Access events from any device</li>
                  <li>Get event reminders</li>
                </ul>
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <Button 
                onClick={() => signIn('google', { 
                  callbackUrl: window.location.href,
                  redirect: true
                })}
                className="w-full"
              >
                <Chrome className="mr-2 h-4 w-4" />
                Connect with Google
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowGoogleAuthPrompt(false)}
              >
                Maybe Later
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  )
}
