import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'

export interface CalendarEvent {
  id?: string
  title: string
  description?: string
  startTime: string
  endTime: string
  type: 'class' | 'office-hours' | 'meeting'
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
    interval?: number
    daysOfWeek?: string[]
    until?: string
  }
  attendees?: string[]
  meetLink?: string
  useGoogleMeet?: boolean
}

export class GoogleCalendarService {
  private calendar: any
  private oauth2Client: OAuth2Client
  private userId: string
  private initialized: boolean = false

  constructor(userId: string) {
    this.userId = userId
    this.oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
    )
  }

  async initialize(accessToken: string) {
    try {
      this.oauth2Client.setCredentials({
        access_token: accessToken
      })
      this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client })
      this.initialized = true
    } catch (error) {
      console.error('Failed to initialize calendar service:', error)
      throw new Error('Failed to initialize calendar service')
    }
  }

  private checkInitialized() {
    if (!this.initialized) {
      throw new Error('Calendar service not initialized')
    }
  }

  private buildRecurrenceRule(recurrence?: CalendarEvent['recurrence']): string[] {
    if (!recurrence) return []

    const rrule = [`RRULE:FREQ=${recurrence.frequency.toUpperCase()}`]
    
    if (recurrence.interval) {
      rrule[0] += `;INTERVAL=${recurrence.interval}`
    }

    if (recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0) {
      rrule[0] += `;BYDAY=${recurrence.daysOfWeek.join(',')}`
    }

    if (recurrence.until) {
      const untilDate = new Date(recurrence.until)
      const untilString = untilDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
      rrule[0] += `;UNTIL=${untilString}`
    }

    return rrule
  }

  async createEvent(event: CalendarEvent): Promise<CalendarEvent> {
    this.checkInitialized();

    try {
      const calendarEvent = {
        summary: event.title,
        description: event.description,
        start: {
          dateTime: event.startTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: event.endTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        attendees: event.attendees?.map(email => ({ email })),
        conferenceData: {
          createRequest: {
            requestId: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
        guestsCanModify: false,
        guestsCanInviteOthers: false,
        sendUpdates: 'all', // Send emails to attendees
      };

      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        conferenceDataVersion: 1,
        requestBody: calendarEvent,
      });

      return {
        id: response.data.id,
        meetLink: response.data.hangoutLink || response.data.conferenceData?.entryPoints?.[0]?.uri,
        ...event
      };
    } catch (error) {
      console.error('Failed to create Google Calendar event:', error);
      throw error;
    }
  }

  async updateEvent(eventId: string, event: Partial<CalendarEvent>): Promise<CalendarEvent> {
    this.checkInitialized()

    try {
      const existingEvent = await this.calendar.events.get({
        calendarId: 'primary',
        eventId,
      })

      const calendarEvent = {
        summary: event.title,
        description: event.description ? `${event.description}\n\nJoin meeting: ${event.meetLink}` : existingEvent.data.description,
        start: event.startTime ? {
          dateTime: event.startTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        } : undefined,
        end: event.endTime ? {
          dateTime: event.endTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        } : undefined,
        attendees: event.attendees?.map(email => ({ email })),
        recurrence: event.recurrence ? this.buildRecurrenceRule(event.recurrence) : undefined,
        extendedProperties: {
          private: {
            ...(existingEvent.data.extendedProperties?.private || {}),
            type: event.type || existingEvent.data.extendedProperties?.private?.type,
            meetLink: event.meetLink || existingEvent.data.extendedProperties?.private?.meetLink,
          }
        }
      }

      const response = await this.calendar.events.patch({
        calendarId: 'primary',
        eventId,
        requestBody: calendarEvent,
      })

      return {
        ...event,
        id: response.data.id,
        meetLink: event.meetLink || response.data.extendedProperties?.private?.meetLink,
      } as CalendarEvent
    } catch (error) {
      console.error('Failed to update Google Calendar event:', error)
      throw new Error('Failed to update Google Calendar event')
    }
  }

  async listEvents(timeMin: string, timeMax: string): Promise<CalendarEvent[]> {
    this.checkInitialized()

    try {
      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: 'startTime',
      })

      return response.data.items.map((item: any) => ({
        id: item.id,
        title: item.summary,
        description: item.description,
        startTime: item.start.dateTime || item.start.date,
        endTime: item.end.dateTime || item.end.date,
        type: item.extendedProperties?.private?.type || 'meeting',
        meetLink: item.extendedProperties?.private?.meetLink || item.hangoutLink,
        attendees: item.attendees?.map((attendee: any) => attendee.email),
        recurrence: item.recurrence
      }))
    } catch (error: any) {
      console.error('Error listing calendar events:', error)
      throw error
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    this.checkInitialized()

    try {
      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId
      })
    } catch (error: any) {
      console.error('Error deleting calendar event:', error)
      throw error
    }
  }
}
