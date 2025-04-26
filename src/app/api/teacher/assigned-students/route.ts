import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/user"
import authOptions from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const teacher = await User.findById(session.user.id)
      .select('students')
      .populate({
        path: 'students',
        select: 'name email studentProfile.subjects studentProfile.assignedTeachers',
      })
      .lean()

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 })
    }

    // Format assigned students with their subjects
    const assignedStudents = teacher.students.map(student => {
      const teacherAssignments = student.studentProfile.assignedTeachers
        .filter(at => at.teacherId.toString() === session.user.id)
      
      return {
        id: student._id,
        name: student.name,
        email: student.email,
        assignedSubjects: teacherAssignments.flatMap(ta => ta.subjects)
      }
    })

    return NextResponse.json(assignedStudents)
  } catch (error) {
    console.error('[ASSIGNED_STUDENTS_ERROR]', error)
    return NextResponse.json(
      { error: "Failed to fetch assigned students" },
      { status: 500 }
    )
  }
}
