import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import { Event } from '@/models/event.model'
import { GoogleCalendarService } from '@/lib/google-calendar'
import { type Session } from 'next-auth'
import sendEmail from '@/lib/email'

// Type guard to check if session has required properties
function isValidSession(session: Session | null): session is Session & { 
  user: { accessToken: string; id: string } 
} {
  return !!session?.user?.accessToken && !!session.user?.id
}

// Helper function to handle errors
const handleError = (error: any) => {
  console.error('API Error:', error)
  
  // Check if it's a database connection error
  if (error.name === 'MongooseError' && error.message.includes('connect')) {
    return NextResponse.json(
      { error: 'Database connection failed' },
      { status: 503 }
    )
  }

  return NextResponse.json(
    { error: error.message || 'Internal server error' },
    { status: 500 }
  )
}

export async function GET(request: Request) {
  try {
    await connectDB();
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const startTime = searchParams.get('startTime')
    const endTime = searchParams.get('endTime')

    console.log('Fetching events with params:', {
      userId: session.user.id,
      startTime,
      endTime
    })

    let query: any = { createdBy: session.user.id }
    if (startTime && endTime) {
      query.startTime = { $gte: startTime }
      query.endTime = { $lte: endTime }
    }

    const events = await Event.find(query).sort({ startTime: 1 })
    return NextResponse.json(events)
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const session = await auth();
    
    if (!isValidSession(session)) {
      return NextResponse.json(
        { error: 'Unauthorized: Please sign in with Google' },
        { status: 401 }
      )
    }

    const data = await request.json()
    console.log('Creating event:', data)

    // Validate required fields
    if (!data.title || !data.startTime || !data.endTime || !data.type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // First, create event in Google Calendar with meet link
    const calendarService = new GoogleCalendarService({
      userId: session.user.id,
      accessToken: session.user.accessToken
    })
    
    const googleEvent = await calendarService.createEvent('primary', {
      ...data,
      createdBy: session.user.id,
      isSynced: true
    })

    console.log('Google Calendar event created:', googleEvent)

    // Store the event in our database with Google Calendar ID and meet link
    const event = await Event.create({
      ...data,
      createdBy: session.user.id,
      googleEventId: googleEvent.googleEventId,
      meetLink: googleEvent.meetLink,
      isSynced: true
    })

    // Send email notifications to attendees if any
    if (data.attendees?.length > 0) {
      try {
        await Promise.all(data.attendees.map(async (attendee: { email: string }) => {
          await sendEmail({
            to: attendee.email,
            subject: `New Event: ${data.title}`,
            template: 'event-invitation',
            replacements: {
              eventTitle: data.title,
              startTime: new Date(data.startTime).toLocaleString(),
              endTime: new Date(data.endTime).toLocaleString(),
              meetLink: googleEvent.meetLink || ''
            }
          })
        }))
      } catch (error) {
        console.error('Failed to send email notifications:', error)
        // Don't fail the request if email sending fails
      }
    }

    return NextResponse.json(event)
  } catch (error) {
    return handleError(error)
  }
}
