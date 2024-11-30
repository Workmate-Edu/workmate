export interface CalendarEvent {
  summary: string
  description?: string
  location?: string
  start: {
    dateTime: string
    timeZone?: string
  }
  end: {
    dateTime: string
    timeZone?: string
  }
  attendees?: Array<{
    email: string
    responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted'
  }>
  reminders?: {
    useDefault?: boolean
    overrides?: Array<{
      method: 'email' | 'popup'
      minutes: number
    }>
  }
  conferenceData?: {
    createRequest?: {
      requestId?: string
      conferenceSolutionKey?: {
        type: string
      }
    }
  }
}

export interface CalendarEventResponse extends CalendarEvent {
  id: string
  status: 'confirmed' | 'tentative' | 'cancelled'
  created: string
  updated: string
  creator: {
    email: string
    self?: boolean
  }
  organizer: {
    email: string
    self?: boolean
  }
  htmlLink?: string
  iCalUID?: string
  sequence?: number
}
