import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { TeachingSession } from "@/models/teaching-session"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'student') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const sessions = await TeachingSession.find({
      studentId: session.user.id,
      startTime: { $gte: new Date() } // Only future sessions
    })
    .populate('teacherId', 'name email')
    .sort({ startTime: 1 })
    .lean()

    return NextResponse.json(sessions)

  } catch (error) {
    console.error('[GET_STUDENT_SCHEDULE_ERROR]', error)
    return NextResponse.json({ error: "Failed to fetch schedule" }, { status: 500 })
  }
}
