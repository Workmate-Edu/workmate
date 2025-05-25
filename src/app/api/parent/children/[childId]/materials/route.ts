import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/user"
import { CourseDocument } from "@/models/course-document"
import { TeachingMaterial } from "@/models/teaching-material"

export async function GET(
  req: Request,
  { params }: { params: { childId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'parent') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Get child with assigned teachers
    const child = await User.findById(params.childId)
      .populate({
        path: 'studentProfile.assignedTeachers.teacherId',
        select: 'name email'
      })
      .select('studentProfile.subjects studentProfile.assignedTeachers')
      .lean()

    if (!child?.studentProfile) {
      return NextResponse.json({ error: "Child not found" }, { status: 404 })
    }

    // Get teachers and their assigned subjects
    const teacherAssignments = child.studentProfile.assignedTeachers?.map(t => ({
      teacherId: t.teacherId._id,
      teacherName: t.teacherId.name,
      subjects: t.subjects || []
    })) || []

    const teacherIds = teacherAssignments.map(t => t.teacherId)

    // Get all documents that match:
    // 1. Documents marked as general
    // 2. Documents for subjects the student is enrolled in
    const documents = await TeachingMaterial.find({
      teacherId: { $in: teacherIds },
      $or: [
        { isGeneral: true },
        {
          'subjects.name': { 
            $in: child.studentProfile.subjects.map(s => s.name.toLowerCase()) 
          },
          'subjects.area': { 
            $in: child.studentProfile.subjects.map(s => s.area.toLowerCase()) 
          }
        }
      ]
    }).lean()

    // Process and map documents
    const processedDocs = documents.map(doc => {
      const teacherInfo = teacherAssignments.find(t => 
        t.teacherId.toString() === doc.teacherId.toString()
      )

      // If subject is not general, ensure it matches a subject the student is enrolled in
      if (!doc.isGeneral && doc.subjects?.[0]) {
        const matchingSubject = child.studentProfile.subjects.find(s =>
          s.name.toLowerCase() === doc.subjects[0].name.toLowerCase() &&
          s.area.toLowerCase() === doc.subjects[0].area.toLowerCase()
        )

        if (!matchingSubject) {
          return null
        }
      }

      return {
        id: doc._id,
        name: doc.name,
        description: doc.description,
        url: doc.url,
        format: doc.format,
        uploadedAt: doc.createdAt,
        subject: doc.isGeneral ? 
          { name: 'General', area: 'General' } : 
          doc.subjects?.[0],
        teacher: teacherInfo?.teacherName
      }
    }).filter(Boolean) // Remove null entries

    return NextResponse.json(processedDocs)

  } catch (error) {
    console.error('[GET_CHILD_MATERIALS_ERROR]', error)
    return NextResponse.json(
      { error: "Failed to fetch materials" },
      { status: 500 }
    )
  }
}
