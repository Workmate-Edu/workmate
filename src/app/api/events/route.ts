import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import { Event } from '@/models/event.model'
import { GoogleCalendarService } from '@/lib/google-calendar'
import sendEmail from '@/lib/email'

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

// Generate a unique meeting ID
const generateMeetingId = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Connect to MongoDB
    await connectDB()

    const { searchParams } = new URL(request.url)
    const startTime = searchParams.get('startTime')
    const endTime = searchParams.get('endTime')

    console.log('Fetching events with params:', {
      userId: session.user.id,
      startTime,
      endTime
    })

    if (!startTime || !endTime) {
      return NextResponse.json(
        { error: 'Start and end times are required' },
        { status: 400 }
      )
    }

    // Parse dates and validate
    const startDate = new Date(startTime)
    const endDate = new Date(endTime)

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      )
    }

    const events = await Event.find({
      createdBy: session.user.id,
      startTime: { $gte: startDate },
      endTime: { $lte: endDate }
    }).lean()

    console.log('Found events:', events)
    return NextResponse.json(events)
  } catch (error: any) {
    return handleError(error)
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check for Google Calendar access
    if (!session.user.accessToken) {
      return NextResponse.json(
        { error: 'Google Calendar connection required to create events' },
        { status: 403 }
      )
    }

    // Connect to MongoDB
    await connectDB()

    const data = await request.json()
    console.log('Creating event:', data)

    // Validate required fields
    if (!data.title || !data.startTime || !data.endTime || !data.type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    try {
      // First, create event in Google Calendar with meet link
      const calendarService = new GoogleCalendarService(session.user.id);
      await calendarService.initialize(session.user.accessToken);
      
      const googleEvent = await calendarService.createEvent({
        ...data,
        useGoogleMeet: true, // Use Google Meet instead of Jitsi
        id: undefined // Let Google generate the ID
      });

      console.log('Google Calendar event created:', googleEvent);

      // Store the event in our database with Google Calendar ID and meet link
      const event = await Event.create({
        ...data,
        createdBy: session.user.id,
        googleEventId: googleEvent.id,
        meetLink: googleEvent.meetLink,
        isSynced: true
      });

      console.log('Event created successfully:', event);
      return NextResponse.json({
        ...event.toJSON(),
        meetLink: googleEvent.meetLink,
        googleEventId: googleEvent.id
      });
    } catch (error) {
      console.error('Failed to create Google Calendar event:', error);
      return NextResponse.json(
        { error: 'Failed to create event in Google Calendar' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Failed to create event:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create event' },
      { status: 500 }
    );
  }
}
