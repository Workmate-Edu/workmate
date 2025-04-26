import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/user"

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

    // Extract subject ID from courseId (format: "subjectId-subjectName")
    const [subjectId] = params.courseId.split('-')

    // Find students assigned to this course
    const students = await User.find({
      role: 'student',
      'studentProfile.courses': {
        $elemMatch: {
          teacherId: session.user.id,
          courseId: subjectId
        }
      }
    })
    .select('_id name email')
    .lean()

    return NextResponse.json(students)

  } catch (error) {
    console.error('[GET_COURSE_STUDENTS_ERROR]', error)
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    )
  }
}
