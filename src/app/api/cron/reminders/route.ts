/*
import { NextResponse } from "next/server"
import { checkUpcomingSessions } from "@/workers/session-reminder"

export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Temporarily disable cron job
// export const schedule = "0 12 * * *"
export const maxDuration = 10 // Set max duration to 10 seconds

export async function GET(req: Request) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await checkUpcomingSessions()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reminder cron error:', error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
*/
