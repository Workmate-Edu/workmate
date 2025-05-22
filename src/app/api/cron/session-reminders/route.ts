import { NextResponse } from "next/server"
import { checkUpcomingSessions } from "@/workers/session-reminder"

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Changed from 300 to 60 to comply with Hobby plan limits
export const runtime = 'nodejs'
export const schedule = "0 12 * * *" // Runs once daily at 12:00 PM UTC

// This pattern tells Vercel it's a cron job:

export async function GET(req: Request) {
  try {
    // Check authorization header for cron job
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await checkUpcomingSessions()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Session reminder cron error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
