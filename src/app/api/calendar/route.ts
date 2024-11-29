import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { GoogleCalendarService } from '@/lib/google-calendar'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.accessToken || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized: Please sign in with Google' },
        { status: 401 }
      )
    }

    const calendar = new GoogleCalendarService(session.user.id)
    await calendar.initialize(session.user.accessToken)

    const event = await request.json()
    console.log('Creating calendar event:', {
      userId: session.user.id,
      event
    })

    const createdEvent = await calendar.createEvent(event)
    return NextResponse.json(createdEvent)
  } catch (error: any) {
    console.error('Error creating calendar event:', {
      error: error.message,
      stack: error.stack
    })
    
    return NextResponse.json(
      { error: `Failed to create calendar event: ${error.message}` },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.accessToken || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized: Please sign in with Google' },
        { status: 401 }
      )
    }

    const calendar = new GoogleCalendarService(session.user.id)
    await calendar.initialize(session.user.accessToken)

    const { searchParams } = new URL(request.url)
    const timeMin = searchParams.get('timeMin') || new Date().toISOString()
    const timeMax = searchParams.get('timeMax') || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

    console.log('Fetching calendar events:', {
      userId: session.user.id,
      timeMin,
      timeMax
    })

    const events = await calendar.listEvents(timeMin, timeMax)
    return NextResponse.json(events)
  } catch (error: any) {
    console.error('Error in calendar API:', {
      error: error.message,
      stack: error.stack
    })
    
    return NextResponse.json(
      { error: `Failed to fetch calendar events: ${error.message}` },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.accessToken || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized: Please sign in with Google' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }

    const calendar = new GoogleCalendarService(session.user.id)
    await calendar.initialize(session.user.accessToken)

    await calendar.deleteEvent(eventId)
    return NextResponse.json({ message: 'Event deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting calendar event:', {
      error: error.message,
      stack: error.stack
    })
    
    return NextResponse.json(
      { error: `Failed to delete calendar event: ${error.message}` },
      { status: 500 }
    )
  }
}
