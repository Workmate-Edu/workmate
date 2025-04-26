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

    const [areaId, subjectName] = params.courseId.split('-')

    await connectDB()

    const teacher = await User.findById(session.user.id)
      .populate('teacherProfile.assignedStudents', 'name studentProfile.subjects studentProfile.grade')
      .lean()

    if (!teacher?.teacherProfile) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 })
    }

    // Find the area and subject
    const area = teacher.teacherProfile.subjects?.find(s => 
      s._id.toString() === areaId
    )

    if (!area || !area.subjects.includes(subjectName)) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // Get students enrolled in this subject
    const enrolledStudents = teacher.teacherProfile.assignedStudents?.filter(student =>
      student.studentProfile?.subjects?.some(s =>
        s.name.toLowerCase() === subjectName.toLowerCase() &&
        s.area === area.area
      )
    ) || []

    return NextResponse.json({
      id: params.courseId,
      name: subjectName,
      area: area.area,
      students: enrolledStudents.map(student => ({
        id: student._id,
        name: student.name,
        grade: student.studentProfile?.grade
      }))
    })

  } catch (error) {
    console.error('[COURSE_DETAIL_ERROR]', error)
    return NextResponse.json(
      { error: "Failed to fetch course details" },
      { status: 500 }
    )
  }
}
