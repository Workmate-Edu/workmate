import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/user"
import { CourseDocument } from "@/models/course-document"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'parent') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Get parent's children and their own student profile if exists
    const parent = await User.findById(session.user.id)
      .populate([
        {
          path: 'parentProfile.children',
          select: 'name studentProfile.subjects studentProfile.assignedTeachers',
          populate: {
            path: 'studentProfile.assignedTeachers.teacherId',
            select: 'name email'
          }
        },
        {
          path: 'studentProfile.subjects',
          select: 'name area level assignedTeacher'
        }
      ])
      .lean()

    const result: any = { children: [] }

    // Add parent's personal materials if they are also a student
    if (parent.studentProfile?.subjects?.length > 0) {
      result.personal = await getPersonalMaterials(parent)
    }

    // Get materials for each child
    if (parent.parentProfile?.children?.length > 0) {
      result.children = await Promise.all(
        parent.parentProfile.children.map(async (child: any) => ({
          id: child._id,
          name: child.name,
          courses: await getChildMaterials(child)
        }))
      )
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('[GET_PARENT_MATERIALS_ERROR]', error)
    return NextResponse.json(
      { error: "Failed to fetch materials" },
      { status: 500 }
    )
  }
}

async function getPersonalMaterials(parent: any) {
  const documents = await CourseDocument.find({
    teacherId: { $in: parent.studentProfile.subjects.map((s: any) => s.assignedTeacher) },
    $or: [
      { isGeneral: true },
      { subjects: { $elemMatch: { area: { $in: parent.studentProfile.subjects.map((s: any) => s.area) } } } }
    ]
  }).lean()

  return {
    courses: parent.studentProfile.subjects.map((subject: any) => ({
      courseId: subject._id,
      courseName: subject.name,
      area: subject.area,
      documents: documents
        .filter(doc => doc.isGeneral || doc.subjects.some(s => s.area === subject.area))
        .map(formatDocument)
    }))
  }
}

async function getChildMaterials(child: any) {
  const teacherId = child.studentProfile?.assignedTeachers?.[0]?.teacherId?._id
  if (!teacherId) return []

  const documents = await CourseDocument.find({
    teacherId,
    $or: [
      { isGeneral: true },
      { subjects: { $elemMatch: { area: { $in: child.studentProfile.subjects.map((s: any) => s.area) } } } }
    ]
  }).lean()

  return child.studentProfile.subjects.map((subject: any) => ({
    courseId: subject._id,
    courseName: subject.name,
    area: subject.area,
    documents: documents
      .filter(doc => doc.isGeneral || doc.subjects.some(s => s.area === subject.area))
      .map(formatDocument)
  }))
}

function formatDocument(doc: any) {
  return {
    id: doc._id,
    name: doc.name,
    description: doc.description,
    url: doc.url,
    format: doc.format,
    uploadedAt: doc.createdAt
  }
}
