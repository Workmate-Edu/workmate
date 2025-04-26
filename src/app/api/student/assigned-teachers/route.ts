import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/user"
import authOptions from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    let teachers = []

    if (session.user.role === 'student') {
      const student = await User.findById(session.user.id)
        .select('studentProfile.assignedTeachers')
        .populate('studentProfile.assignedTeachers.teacherId', 'name email teacherProfile.rating')
        .lean()

      teachers = student.studentProfile.assignedTeachers.map(assignment => ({
        id: assignment.teacherId._id,
        name: assignment.teacherId.name,
        email: assignment.teacherId.email,
        rating: assignment.teacherId.teacherProfile.rating,
        subject: assignment.subject,
        assignedAt: assignment.assignedAt
      }))
    } else if (session.user.role === 'parent') {
      const parent = await User.findById(session.user.id)
        .select('parentProfile.assignedTeachers')
        .populate([
          {
            path: 'parentProfile.assignedTeachers.teacherId',
            select: 'name email teacherProfile.rating'
          },
          {
            path: 'parentProfile.assignedTeachers.childId',
            select: 'name'
          }
        ])
        .lean()

      teachers = parent.parentProfile.assignedTeachers.map(assignment => ({
        id: assignment.teacherId._id,
        name: assignment.teacherId.name,
        email: assignment.teacherId.email,
        rating: assignment.teacherId.teacherProfile.rating,
        childName: assignment.childId.name,
        assignedAt: assignment.assignedAt
      }))
    }

    return NextResponse.json(teachers)
  } catch (error) {
    console.error('[ASSIGNED_TEACHERS_ERROR]', error)
    return NextResponse.json(
      { error: "Failed to fetch assigned teachers" },
      { status: 500 }
    )
  }
}
