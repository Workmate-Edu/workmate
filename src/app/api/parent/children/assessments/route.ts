import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectDB } from "@/lib/mongodb"
import { Child } from "@/models/child"
import authOptions from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'parent') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const children = await Child.find({ parent: session.user.id })
      .select('name grade assessmentStatus assignedTeacher assessmentCompletion')
      .populate('assignedTeacher.teacherId', 'name email')
      .lean()

    const formattedAssessments = children.map(child => ({
      _id: child._id,
      name: child.name,
      grade: child.grade,
      assessmentStatus: child.assessmentStatus,
      assignedTeacher: child.assignedTeacher ? {
        name: child.assignedTeacher.teacherId.name,
        email: child.assignedTeacher.teacherId.email,
        assignedAt: child.assignedTeacher.assignedAt
      } : undefined,
      assessmentCompletion: child.assessmentCompletion || undefined
    }))

    return NextResponse.json(formattedAssessments)
  } catch (error) {
    console.error('[PARENT_CHILDREN_ASSESSMENTS_ERROR]', error)
    return NextResponse.json(
      { error: "Failed to fetch assessments" },
      { status: 500 }
    )
  }
}
