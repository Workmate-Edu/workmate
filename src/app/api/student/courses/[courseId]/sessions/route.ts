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
    if (!session?.user || session.user.role !== 'student') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const [subjectId] = params.courseId.split('-')

    const sessions = await TeachingSession.find({
      studentId: session.user.id,
      courseId: subjectId
    })
    .populate('teacherId', 'name email')
    .sort({ startTime: 1 }) // Ascending order for student view
    .lean()

    return NextResponse.json(sessions)

  } catch (error) {
    console.error('[GET_STUDENT_SESSIONS_ERROR]', error)
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    )
  }
}
