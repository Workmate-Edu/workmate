import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/user"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'teacher') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const teacher = await User.findById(session.user.id)
      .select('teacherProfile.subjects teacherProfile.assignedStudents')
      .populate('teacherProfile.assignedStudents', 'name studentProfile.subjects')
      .lean()

    if (!teacher?.teacherProfile) {
      return NextResponse.json([])
    }

    const activeCourses = []
    const { subjects = [], assignedStudents = [] } = teacher.teacherProfile

    // Process each area
    subjects.forEach(area => {
      const areaSubjects = area.subjects.map(subjectName => {
        // Find students assigned to this subject
        const studentsInSubject = assignedStudents.filter(student => 
          student.studentProfile?.subjects?.some(s => 
            s.name.toLowerCase() === subjectName.toLowerCase() && 
            s.area === area.area
          )
        )

        if (studentsInSubject.length > 0) {
          return {
            id: `${area._id}-${subjectName}`,
            name: subjectName,
            area: area.area,
            studentCount: studentsInSubject.length,
            students: studentsInSubject.map(s => ({
              id: s._id,
              name: s.name
            }))
          }
        }
        return null
      }).filter(Boolean)

      if (areaSubjects.length > 0) {
        activeCourses.push({
          area: area.area,
          subjects: areaSubjects
        })
      }
    })

    return NextResponse.json(activeCourses)

  } catch (error) {
    console.error('[TEACHER_COURSES_ERROR]', error)
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 })
  }
}
