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
    if (!session?.user?.id || session.user.role !== 'teacher') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Get student with populated assignedTeachers
    const student = await User.findById(params.studentId)
      .select('name email isActive gender studentProfile')
      .populate({
        path: 'studentProfile.assignedTeachers',
        match: { teacherId: session.user.id }
      })
      .lean()

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Check if this teacher is assigned to the student
    const teacherAssignment = student.studentProfile?.assignedTeachers?.[0]
    if (!teacherAssignment) {
      console.log('No teacher assignment found:', {
        studentId: params.studentId,
        teacherId: session.user.id,
        assignedTeachers: student.studentProfile?.assignedTeachers
      })
      return NextResponse.json({ error: "Not authorized to view this student" }, { status: 403 })
    }

    // Format response with teaching subjects
    const formattedStudent = {
      id: student._id,
      name: student.name,
      email: student.email,
      type: student.studentProfile?.registeredAs || 'independent',
      status: student.isActive ? 'active' : 'inactive',
      gender: student.gender,
      grade: student.studentProfile?.grade,
      subjects: student.studentProfile?.subjects?.map(s => ({
        name: s.name,
        area: s.area,
        progress: s.progress || 0,
        isTeaching: teacherAssignment.subjects.some(
          ts => ts.name === s.name && ts.area === s.area
        )
      })) || []
    }

    return NextResponse.json(formattedStudent)

  } catch (error) {
    console.error('[TEACHER_STUDENT_DETAILS_ERROR]', error)
    return NextResponse.json(
      { error: "Failed to fetch student details" },
      { status: 500 }
    )
  }
}
