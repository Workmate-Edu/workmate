import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { TeachingSession } from "@/models/teaching-session"

export async function GET(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'teacher') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Extract subject name from courseId
    const [_, subjectName] = params.courseId.split('-')

    // Get all sessions for this subject
    const sessions = await TeachingSession.find({
      teacherId: session.user.id,
      'subject.name': subjectName.toLowerCase(),
      endTime: { $gte: new Date() }
    })
    .populate('studentId', 'name email')
    .sort({ startTime: 1 })
    .lean()

    return NextResponse.json(sessions)

  } catch (error) {
    console.error('[GET_COURSE_SESSIONS_ERROR]', error)
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    )
  }
}
