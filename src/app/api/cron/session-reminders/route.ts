import { NextResponse } from "next/server"
import { checkUpcomingSessions } from "@/workers/session-reminder"

export const dynamic = 'force-dynamic'
export const maxDuration = 300
export const schedule = "0 6,14,22 * * *" // Runs at 6 AM, 2 PM, and 10 PM UTC

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
