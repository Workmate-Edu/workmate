import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/user"
import { CourseDocument } from "@/models/course-document"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'student') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Get student's subjects and teacher info
    const student = await User.findById(session.user.id)
      .populate('studentProfile.assignedTeachers.teacherId')
      .select('studentProfile.subjects studentProfile.assignedTeachers')
      .lean()

    if (!student?.studentProfile) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    const teacherId = student.studentProfile.assignedTeachers?.[0]?.teacherId?._id

    if (!teacherId) {
      return NextResponse.json([])
    }

    // Get subjects as objects with area and name
    const subjectQueries = student.studentProfile.subjects.map(s => ({
      subjects: {
        $elemMatch: {
          area: s.area,
          name: s.name
        }
      }
    }))

    // Get all documents for student's subjects
    const documents = await CourseDocument.find({
      teacherId,
      $or: [
        { isGeneral: true },
        ...subjectQueries
      ]
    })
    .sort({ createdAt: -1 })
    .lean()

    return NextResponse.json(
      documents.map(doc => ({
        id: doc._id,
        name: doc.name,
        description: doc.description,
        url: doc.url,
        format: doc.format,
        size: doc.size,
        uploadedAt: doc.createdAt,
        courseName: doc.subjects?.[0]?.name || 'General'
      }))
    )

  } catch (error) {
    console.error('[GET_STUDENT_MATERIALS_ERROR]', error)
    return NextResponse.json(
      { error: "Failed to fetch materials" },
      { status: 500 }
    )
  }
}
