import { NextResponse } from "next/server"
import { checkUpcomingSessions } from "@/workers/session-reminder"

export async function GET() {
  try {
    await checkUpcomingSessions()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Test reminder error:', error)
    return NextResponse.json({ error: "Failed to run reminders" }, { status: 500 })
  }
}
