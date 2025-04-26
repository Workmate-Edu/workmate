import { format, isValid } from 'date-fns'

export interface CalendarEvent {
  summary: string;
  description: string;
  start: Date;
  end: Date;
  location?: string;
  recurrence?: {
    frequency: string
    until: Date
    byDay?: string[]
  }
}

export const createCalendarEvent = (session: any): CalendarEvent => {
  const event = {
    summary: `${session.subject.name} Class Session`,
    description: `Class session with ${session.teacherId.name}`,
    start: new Date(session.startTime),
    end: new Date(session.endTime),
    location: session.meetingLink
  }

  if (session.recurrence?.isRecurring) {
    const days = session.recurrence.daysOfWeek
      .map(d => ['SU','MO','TU','WE','TH','FR','SA'][d])
      .join(',')

    event.recurrence = {
      frequency: session.recurrence.pattern.toUpperCase(),
      until: new Date(session.recurrence.endsOn),
      byDay: days ? days.split(',') : undefined
    }
  }

  return event
}

const formatDateForCalendar = (date: Date | string): string => {
  const dateObj = date instanceof Date ? date : new Date(date)
  if (!isValid(dateObj)) {
    throw new Error('Invalid date provided')
  }
  return format(dateObj, "yyyyMMdd'T'HHmmss'Z'")
}

export const generateICS = (event: CalendarEvent): string => {
  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Workmate//Teaching Sessions//EN',
    'BEGIN:VEVENT',
    `DTSTART:${formatICSDate(event.start)}`,
    `DTEND:${formatICSDate(event.end)}`,
    `SUMMARY:${event.summary}`,
    `DESCRIPTION:${event.description}`,
    event.location && `LOCATION:${event.location}`,
  ]

  // Add recurrence rule if applicable
  if (event.recurrence?.pattern !== 'none' && event.recurrence?.endDate) {
    const freq = event.recurrence.pattern.toUpperCase()
    const until = formatICSDate(event.recurrence.endDate)
    const byday = event.recurrence.daysOfWeek?.map(d => 
      ['SU','MO','TU','WE','TH','FR','SA'][d]
    ).join(',')

    icsLines.push(`RRULE:FREQ=${freq}${byday ? ';BYDAY=' + byday : ''};UNTIL=${until}`)
  }

  icsLines.push(
    'END:VEVENT',
    'END:VCALENDAR'
  )

  return icsLines.filter(Boolean).join('\r\n')
}

export const generateGoogleCalendarLink = (event: CalendarEvent): string => {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.summary,
    details: event.description,
    dates: `${formatICSDate(event.start)}/${formatICSDate(event.end)}`,
    location: event.location || ''
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export const generateOutlookCalendarLink = (event: CalendarEvent): string => {
  const params = new URLSearchParams({
    subject: event.summary,
    body: event.description,
    startdt: event.start.toISOString(),
    enddt: event.end.toISOString(),
    location: event.location || '',
    path: '/calendar/action/compose'
  })
  return `https://outlook.office.com/calendar/0/deeplink/compose?${params.toString()}`
}

function formatDate(date: Date): string {
  return format(date, "yyyyMMdd'T'HHmmss'Z'")
}
