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
    console.log('Request to fetch sessions for course:', params.courseId); // Add debug log
    
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Extract subject info from courseId (e.g., "67eab75d6f9ce9391b9acbd6-yoruba")
    const [_, subjectName] = params.courseId.split('-')
    console.log('Subject name:', subjectName); // Add debug log

    // Find sessions for this course
    const sessions = await TeachingSession.find({
      teacherId: session.user.id,
      'subject.name': subjectName.toLowerCase()
    })
    .populate('studentId', 'name email')
    .sort({ startTime: 1 })
    .lean()

    console.log('Found sessions:', sessions.length); // Add debug log

    return NextResponse.json(sessions)

  } catch (error) {
    console.error('[GET_COURSE_SESSIONS_ERROR]', error)
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    )
  }
}
