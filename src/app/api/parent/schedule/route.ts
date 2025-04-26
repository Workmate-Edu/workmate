import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/user"
import { TeachingSession } from "@/models/teaching-session"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'parent') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Get parent's children
    const parent = await User.findById(session.user.id)
      .select('parentProfile.children')
      .lean()

    const childrenIds = parent.parentProfile?.children || []

    // Get all sessions for all children
    const sessions = await TeachingSession.find({
      studentId: { $in: childrenIds }
    })
    .populate('teacherId', 'name email')
    .populate('studentId', 'name')
    .populate('subject')
    .sort({ startTime: 1 })
    .lean()

    const formattedSessions = sessions.map(session => ({
      id: session._id,
      student: {
        id: session.studentId._id,
        name: session.studentId.name
      },
      teacher: {
        name: session.teacherId.name,
        email: session.teacherId.email
      },
      subject: session.subject,
      startTime: session.startTime,
      endTime: session.endTime,
      duration: session.duration,
      meetingLink: session.meetingLink,
      status: session.status
    }))

    return NextResponse.json(formattedSessions)

  } catch (error) {
    console.error('[PARENT_SCHEDULE_ERROR]', error)
    return NextResponse.json(
      { error: "Failed to fetch schedule" },
      { status: 500 }
    )
  }
}
