import { calendar_v3 } from '@googleapis/calendar'
import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'
import { CalendarEvent, Attendee, Recurrence } from '@/models/event.model'
import mongoose from 'mongoose'

interface GoogleCalendarConfig {
  userId: string
  accessToken: string
}

export class GoogleCalendarService {
  private calendar: calendar_v3.Calendar
  private oauth2Client: OAuth2Client
  private userId: string

  constructor({ userId, accessToken }: GoogleCalendarConfig) {
    this.userId = userId
    this.oauth2Client = new google.auth.OAuth2()
    this.oauth2Client.setCredentials({
      access_token: accessToken,
    })
    this.calendar = google.calendar({
      version: 'v3',
      auth: this.oauth2Client,
    })
  }

  private fromGoogleEvent(event: calendar_v3.Schema$Event): Partial<CalendarEvent> {
    if (!event.id || !event.start?.dateTime || !event.end?.dateTime) {
      throw new Error('Invalid Google Calendar event')
    }

    let recurrence: Recurrence | undefined
    if (event.recurrence?.[0]) {
      const rrule = event.recurrence[0]
      const freqMatch = rrule.match(/FREQ=([^;]+)/)
      const intervalMatch = rrule.match(/INTERVAL=(\d+)/)
      const untilMatch = rrule.match(/UNTIL=([^;]+)/)
      const bydayMatch = rrule.match(/BYDAY=([^;]+)/)

      if (freqMatch) {
        recurrence = {
          frequency: freqMatch[1].toLowerCase() as Recurrence['frequency'],
          interval: intervalMatch ? parseInt(intervalMatch[1]) : 1,
          until: untilMatch ? untilMatch[1] : undefined,
          daysOfWeek: bydayMatch ? bydayMatch[1].split(',') : undefined
        }
      }
    }

    return {
      googleEventId: event.id,
      title: event.summary || '',
      description: event.description || '',
      startTime: event.start.dateTime,
      endTime: event.end.dateTime,
      type: event.description?.includes('class') ? 'class' : 
            event.description?.includes('office-hours') ? 'office-hours' : 'meeting',
      createdBy: this.userId,
      isSynced: true,
      recurrence,
      attendees: event.attendees?.map(a => ({
        email: a.email || '',
        responseStatus: (a.responseStatus as Attendee['responseStatus']) || 'needsAction',
        displayName: a.displayName || undefined
      })) || [],
      meetLink: event.hangoutLink ?? event.conferenceData?.entryPoints?.[0]?.uri ?? undefined
    }
  }

  private toGoogleEvent(event: Partial<CalendarEvent>): calendar_v3.Schema$Event {
    const googleEvent: calendar_v3.Schema$Event = {
      summary: event.title,
      description: event.description,
      start: {
        dateTime: event.startTime,
        timeZone: 'UTC',
      },
      end: {
        dateTime: event.endTime,
        timeZone: 'UTC',
      },
      attendees: event.attendees?.map(a => ({
        email: a.email,
        displayName: a.displayName,
        responseStatus: a.responseStatus || 'needsAction'
      })),
    }

    if (event.recurrence) {
      const { frequency, interval, until, daysOfWeek } = event.recurrence
      let recurrenceRule = `RRULE:FREQ=${frequency.toUpperCase()}`
      if (interval) recurrenceRule += `;INTERVAL=${interval}`
      if (until) recurrenceRule += `;UNTIL=${until.replace(/-/g, '').replace(/:/g, '')}`
      if (daysOfWeek?.length) recurrenceRule += `;BYDAY=${daysOfWeek.join(',')}`
      googleEvent.recurrence = [recurrenceRule]
    }

    if (event.meetLink) {
      googleEvent.conferenceData = {
        createRequest: {
          requestId: new mongoose.Types.ObjectId().toString(),
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      }
    }

    return googleEvent
  }

  async listCalendars(): Promise<calendar_v3.Schema$CalendarListEntry[]> {
    try {
      const response = await this.calendar.calendarList.list()
      return response.data.items || []
    } catch (error) {
      console.error('Failed to list calendars:', error)
      throw error
    }
  }

  async getEvents(calendarId: string, timeMin?: Date, timeMax?: Date): Promise<Partial<CalendarEvent>[]> {
    try {
      const response = await this.calendar.events.list({
        calendarId,
        timeMin: timeMin?.toISOString(),
        timeMax: timeMax?.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      })

      return (response.data.items || []).map(event => this.fromGoogleEvent(event))
    } catch (error) {
      console.error('Failed to get events:', error)
      throw error
    }
  }

  async createEvent(calendarId: string, event: Partial<CalendarEvent>): Promise<CalendarEvent> {
    try {
      const response = await this.calendar.events.insert({
        calendarId,
        requestBody: this.toGoogleEvent(event),
        conferenceDataVersion: event.meetLink ? 1 : 0,
      })

      if (!response.data.id) {
        throw new Error('Failed to create Google Calendar event')
      }

      const updatedEvent: CalendarEvent = {
        ...event as CalendarEvent,
        googleEventId: response.data.id,
        meetLink: response.data.hangoutLink ?? response.data.conferenceData?.entryPoints?.[0]?.uri ?? undefined,
        isSynced: true,
        createdBy: this.userId
      }

      const eventModel = mongoose.model<CalendarEvent>('Event')
      const savedEvent = await eventModel.create(updatedEvent)

      return savedEvent.toObject()
    } catch (error) {
      console.error('Failed to create event:', error)
      throw error
    }
  }

  async updateEvent(calendarId: string, event: Partial<CalendarEvent>): Promise<CalendarEvent> {
    if (!event.googleEventId) {
      throw new Error('Cannot update event without Google Calendar ID')
    }

    try {
      const response = await this.calendar.events.update({
        calendarId,
        eventId: event.googleEventId,
        requestBody: this.toGoogleEvent(event),
        conferenceDataVersion: event.meetLink ? 1 : 0,
      })

      const updatedEvent: Partial<CalendarEvent> = {
        ...event,
        meetLink: response.data.hangoutLink ?? response.data.conferenceData?.entryPoints?.[0]?.uri ?? undefined,
        isSynced: true
      }

      const eventModel = mongoose.model<CalendarEvent>('Event')
      const savedEvent = await eventModel.findByIdAndUpdate(
        event._id,
        updatedEvent,
        { new: true, runValidators: true }
      )

      if (!savedEvent) {
        throw new Error('Event not found in database')
      }

      return savedEvent.toObject()
    } catch (error) {
      console.error('Failed to update event:', error)
      throw error
    }
  }

  async deleteEvent(calendarId: string, eventId: string): Promise<void> {
    try {
      const eventModel = mongoose.model<CalendarEvent>('Event')
      const event = await eventModel.findById(eventId)
      if (!event?.googleEventId) return

      await this.calendar.events.delete({
        calendarId,
        eventId: event.googleEventId,
      })

      await eventModel.findByIdAndDelete(eventId)
    } catch (error) {
      console.error('Failed to delete event:', error)
      throw error
    }
  }

  async syncEvents(calendarId: string): Promise<void> {
    try {
      const eventModel = mongoose.model<CalendarEvent>('Event')
      const localEvents = await eventModel.find({ createdBy: this.userId })
      
      const oneMonthAgo = new Date()
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
      
      const oneYearFromNow = new Date()
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)

      const googleEvents = await this.getEvents(calendarId, oneMonthAgo, oneYearFromNow)

      // Update or create events from Google Calendar
      for (const googleEvent of googleEvents) {
        const localEvent = localEvents.find(e => e.googleEventId === googleEvent.googleEventId)
        if (localEvent) {
          await this.updateEvent(calendarId, { ...localEvent.toObject(), ...googleEvent })
        } else {
          await this.createEvent(calendarId, googleEvent)
        }
      }

      // Delete local events that no longer exist in Google Calendar
      const googleEventIds = new Set(googleEvents.map(e => e.googleEventId))
      for (const localEvent of localEvents) {
        if (localEvent.googleEventId && !googleEventIds.has(localEvent.googleEventId)) {
          await eventModel.findByIdAndDelete(localEvent._id)
        }
      }
    } catch (error) {
      console.error('Failed to sync events:', error)
      throw error
    }
  }
}
