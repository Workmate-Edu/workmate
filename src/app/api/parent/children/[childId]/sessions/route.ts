import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { TeachingSession } from "@/models/teaching-session"

export async function GET(
  req: Request,
  { params }: { params: { childId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'parent') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const sessions = await TeachingSession.find({
      studentId: params.childId
    })
    .populate('teacherId', 'name email')
    .populate('subject')
    .sort({ startTime: 1 })
    .lean()

    return NextResponse.json(sessions.map(session => ({
      id: session._id,
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
    })))

  } catch (error) {
    console.error('[GET_CHILD_SESSIONS_ERROR]', error)
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    )
  }
}
