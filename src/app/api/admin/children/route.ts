import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectDB } from "@/lib/mongodb"
import { Child } from "@/models/child"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const children = await Child.find()
      .populate('parent', 'name email')
      .populate({
        path: 'assignedTeacher.teacherId',
        select: 'name email teacherProfile.rating teacherProfile.subjects'
      })
      .select('name grade subjects assessmentHistory assignedTeacher status')
      .lean()

    const formattedChildren = children.map(child => ({
      id: child._id,
      name: child.name,
      type: 'child',
      grade: child.grade,
      subjects: child.subjects.map(s => s.name),
      parent: {
        name: child.parent?.name,
        email: child.parent?.email
      },
      assignedTeacher: child.assignedTeacher ? {
        id: child.assignedTeacher.teacherId._id,
        name: child.assignedTeacher.teacherId.name,
        email: child.assignedTeacher.teacherId.email,
        rating: child.assignedTeacher.teacherId.teacherProfile?.rating,
        subjects: child.assignedTeacher.subjects.map(s => s.name),
        assignedAt: child.assignedTeacher.assignedAt,
        status: child.assignedTeacher.status
      } : undefined,
      status: child.status,
      assessmentStatus: child.assessmentStatus
    }))

    return NextResponse.json({ children: formattedChildren })
  } catch (error) {
    console.error('[CHILDREN_GET]', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
