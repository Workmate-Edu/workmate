import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { GoogleCalendarService } from '@/lib/google-calendar'
import { type Session } from 'next-auth'
import { CalendarEvent } from '@/models/event.model'

// Type guard to check if session has required properties
function isValidSession(session: Session | null): session is Session & { 
  user: { accessToken: string; id: string } 
} {
  return !!session?.user?.accessToken && !!session.user?.id
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!isValidSession(session)) {
      return NextResponse.json(
        { error: 'Unauthorized: Please sign in with Google' },
        { status: 401 }
      )
    }

    const calendar = new GoogleCalendarService({
      userId: session.user.id,
      accessToken: session.user.accessToken
    })

    const eventData = await request.json()
    console.log('Creating calendar event:', {
      userId: session.user.id,
      eventData
    })

    // Create event with required fields
    const event: CalendarEvent = {
      title: eventData.summary || eventData.title,
      description: eventData.description,
      startTime: eventData.start?.dateTime || eventData.startTime,
      endTime: eventData.end?.dateTime || eventData.endTime,
      type: eventData.type || 'meeting',
      attendees: eventData.attendees?.map((a: { email: string; responseStatus?: string }) => ({
        email: a.email,
        responseStatus: a.responseStatus || 'needsAction'
      })),
      createdBy: session.user.id,
      isSynced: true,
      recurrence: eventData.recurrence,
      meetLink: eventData.meetLink
    }

    const createdEvent = await calendar.createEvent('primary', event)
    return NextResponse.json(createdEvent)
  } catch (error) {
    console.error('Failed to create calendar event:', error)
    return NextResponse.json(
      { error: 'Failed to create calendar event' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!isValidSession(session)) {
      return NextResponse.json(
        { error: 'Unauthorized: Please sign in with Google' },
        { status: 401 }
      )
    }

    const calendar = new GoogleCalendarService({
      userId: session.user.id,
      accessToken: session.user.accessToken
    })

    const { searchParams } = new URL(request.url)
    const timeMin = searchParams.get('timeMin')
    const timeMax = searchParams.get('timeMax')

    if (!timeMin || !timeMax) {
      return NextResponse.json(
        { error: 'Missing required timeMin and timeMax parameters' },
        { status: 400 }
      )
    }

    const events = await calendar.getEvents(
      'primary',
      new Date(timeMin),
      new Date(timeMax)
    )

    return NextResponse.json({ events })
  } catch (error) {
    console.error('Failed to list calendar events:', error)
    return NextResponse.json(
      { error: 'Failed to list calendar events' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth()

    if (!isValidSession(session)) {
      return NextResponse.json(
        { error: 'Unauthorized: Please sign in with Google' },
        { status: 401 }
      )
    }

    const calendar = new GoogleCalendarService({
      userId: session.user.id,
      accessToken: session.user.accessToken
    })

    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')

    if (!eventId) {
      return NextResponse.json(
        { error: 'Missing required eventId parameter' },
        { status: 400 }
      )
    }

    await calendar.deleteEvent('primary', eventId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete calendar event:', error)
    return NextResponse.json(
      { error: 'Failed to delete calendar event' },
      { status: 500 }
    )
  }
}
