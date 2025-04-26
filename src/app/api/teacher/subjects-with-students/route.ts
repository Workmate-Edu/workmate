import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/user"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'teacher') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Get teacher with subjects and assigned students
    const teacher = await User.findById(session.user.id)
      .select('teacherProfile.subjects assignedStudents')
      .populate('assignedStudents', 'name email studentProfile.grade')
      .lean()

    if (!teacher?.teacherProfile?.subjects) {
      return NextResponse.json([])
    }

    // Format subjects with their assigned students
    const subjectsWithStudents = teacher.teacherProfile.subjects.flatMap(area => 
      area.subjects.map(subject => ({
        id: `${area._id}-${subject}`,
        name: subject,
        area: area.area,
        students: teacher.assignedStudents?.map(student => ({
          id: student._id,
          name: student.name,
          email: student.email,
          grade: student.studentProfile?.grade
        })) || []
      }))
    )

    return NextResponse.json(subjectsWithStudents)

  } catch (error) {
    console.error('[TEACHER_SUBJECTS_WITH_STUDENTS_GET]', error)
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 }
    )
  }
}
