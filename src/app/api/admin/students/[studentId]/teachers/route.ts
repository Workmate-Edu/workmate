import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/user"
import authOptions from "@/lib/auth"

export async function GET(
  req: Request,
  { params }: { params: { studentId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    // Fix authorization check by removing extra negation
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const student = await User.findById(params.studentId)
      .select('studentProfile.assignedTeachers')
      .populate({
        path: 'studentProfile.assignedTeachers.teacherId',
        select: 'name email subjects teacherProfile.rating'
      })
      .lean()

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Format teacher assignments - modified to handle all subjects
    const assignments = (student.studentProfile?.assignedTeachers || []).flatMap(at => 
      // Map each subject for this teacher assignment
      at.subjects.map(subject => ({
        teacherId: at.teacherId._id,
        subject: {
          name: subject.name,
          area: subject.area
        },
        teacher: {
          id: at.teacherId._id,
          name: at.teacherId.name,
          email: at.teacherId.email,
          rating: at.teacherId.teacherProfile?.rating || 0
        }
      }))
    )

    return NextResponse.json(assignments)

  } catch (error) {
    console.error('[STUDENT_TEACHERS_ERROR]', error)
    return NextResponse.json(
      { error: "Failed to fetch teacher assignments" },
      { status: 500 }
    )
  }
}
