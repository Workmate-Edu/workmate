import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { TeachingSession } from "@/models/teaching-session"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    console.log('Fetching sessions for student:', session.user.id)

    const sessions = await TeachingSession.find({
      studentId: session.user.id
    })
    .populate('teacherId', 'name email profileImage') // Ensure we're populating teacher info
    .sort({ startTime: 1 })
    .lean()

    // Transform the data to match the frontend expectations
    const transformedSessions = sessions.map(session => ({
      ...session,
      teacher: session.teacherId, // Add teacher field with teacherId data
      _id: session._id.toString()
    }))

    console.log('Found sessions:', sessions.length)

    return NextResponse.json(transformedSessions)
  } catch (error) {
    console.error('[STUDENT_SESSIONS_GET]', error)
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    )
  }
}
