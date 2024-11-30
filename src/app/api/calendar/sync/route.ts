import { auth } from '@/lib/auth'
import { GoogleCalendarService } from '@/lib/google-calendar'
import { NextResponse } from 'next/server'
import { type Session } from 'next-auth'

// Type guard to check if session has required properties
function isValidSession(session: Session | null): session is Session & { 
  user: { accessToken: string; id: string } 
} {
  return !!session?.user?.accessToken && !!session.user?.id
}

export async function POST() {
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

    const result = await calendar.syncEvents('primary')
    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to sync calendar:', error)
    return NextResponse.json(
      { error: 'Failed to sync calendar' },
      { status: 500 }
    )
  }
}
