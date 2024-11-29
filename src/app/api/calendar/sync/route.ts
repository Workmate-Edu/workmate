import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { GoogleCalendarService } from '@/lib/google-calendar'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.accessToken || !session.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const calendar = new GoogleCalendarService(session.user.id)
    await calendar.initialize(session.user.accessToken)
    const { added = [], deleted = [] } = await calendar.sync()

    return NextResponse.json({ added, deleted })
  } catch (error) {
    console.error('Error syncing calendar:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
