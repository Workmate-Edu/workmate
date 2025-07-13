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

    // Load the parent document, to see if they’re learning
    const parent = await User.findById(session.user.id)
      .select('parentProfile.interestedInLearning')
      .lean()
    const isLearning = !!parent.parentProfile?.interestedInLearning

    // If they’re learning, fetch *their* sessions,
    // otherwise (if you ever keep "child sessions") you could still fetch children
    let sessions
    if (isLearning) {
      sessions = await TeachingSession.find({
        studentId: session.user.id
      })
    } else {
      // fallback: fetch children’s sessions
      const childrenIds = parent.parentProfile?.children || []
      sessions = await TeachingSession.find({
        studentId: { $in: childrenIds }
      })
    }

    // populate & sort
    const populated = await TeachingSession.populate(sessions, [
      { path: 'teacherId', select: 'name email' },
      { path: 'studentId', select: 'name' },
      { path: 'subject' }
    ])

    const formatted = populated
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
      .map(sess => ({
        id: sess._id,
        student: {
          id: sess.studentId._id,
          name: sess.studentId.name
        },
        teacher: {
          name: sess.teacherId.name,
          email: sess.teacherId.email
        },
        subject: sess.subject,
        startTime: sess.startTime,
        endTime: sess.endTime,
        duration: sess.duration,
        meetingLink: sess.meetingLink,
        status: sess.status
      }))

    return NextResponse.json(formatted)

  } catch (error) {
    console.error('[PARENT_SCHEDULE_ERROR]', error)
    return NextResponse.json(
      { error: "Failed to fetch schedule" },
      { status: 500 }
    )
  }
}
