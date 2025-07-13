import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/user"
// import { CourseDocument } from "@/models/course-document"
import { TeachingMaterial } from "@/models/teaching-material"

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

    // Extract the base courseId and subject name
    const [courseId, subjectName] = params.courseId.split('-')

    // Get student's teacher and subject info
    const student = await User.findById(session.user.id)
      .populate('studentProfile.assignedTeachers.teacherId')
      .lean()

    const subject = student?.studentProfile?.subjects?.find(
      s => s._id.toString() === courseId
    )

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 })
    }

    const teacherId = student?.studentProfile?.assignedTeachers?.[0]?.teacherId?._id

    if (!teacherId) {
      return NextResponse.json({ error: "No teacher assigned" }, { status: 404 })
    }

    // Get documents with proper subject area filtering
    const documents = await TeachingMaterial.find({
      teacherId,
      $or: [
        { isGeneral: true },
        { subjects: { $elemMatch: { area: subject.area, name: subject.name } } }
      ]
    })
    .select('name description url format size createdAt')
    .sort({ createdAt: -1 })
    .lean()

    return NextResponse.json(documents.map(doc => ({
      id: doc._id,
      name: doc.name,
      description: doc.description,
      url: doc.url,
      format: doc.format,
      size: doc.size,
      uploadedAt: doc.createdAt
    })))

  } catch (error) {
    console.error('[GET_COURSE_DOCUMENTS_ERROR]', error)
    return NextResponse.json(
      { error: "Failed to fetch course documents" },
      { status: 500 }
    )
  }
}
