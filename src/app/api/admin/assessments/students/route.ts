import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { InitialAssessment } from "@/models/initial-assessment"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const assessments = await InitialAssessment.find({ 
      status: 'pending' 
    })
    .populate('studentId', 'name email studentProfile.assignedTeachers')
    .populate({
      path: 'assignedTeacher.teacherId',
      select: 'name email teacherProfile.rating'
    })
    .lean()

    return NextResponse.json({ 
      assessments: assessments.map(a => ({
        ...a,
        _id: a._id.toString(),
        student: {
          name: a.studentId.name,
          email: a.studentId.email
        },
        teacher: a.assignedTeacher ? {
          name: a.assignedTeacher.teacherId?.name,
          email: a.assignedTeacher.teacherId?.email,
          rating: a.assignedTeacher.teacherId?.teacherProfile?.rating,
          assignedAt: a.assignedTeacher.assignedAt
        } : null,
        completedAt: a.createdAt
      }))
    })
  } catch (error) {
    console.error('[STUDENT_ASSESSMENTS_GET]', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
