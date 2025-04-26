import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/user"
import authOptions from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'student') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const student = await User.findById(session.user.id)
      .select('studentProfile.assignedTeachers')
      .populate({
        path: 'studentProfile.assignedTeachers.teacherId',
        select: 'name email phone bio teacherProfile.rating teacherProfile.qualifications teacherProfile.subjects language'
      })
      .lean()

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Format teacher data
    const teachers = student.studentProfile?.assignedTeachers?.map(at => ({
      id: at.teacherId._id,
      name: at.teacherId.name,
      email: at.teacherId.email,
      bio: at.teacherId.bio,
      phone: at.teacherId.phone,
      language: at.teacherId.language,
      rating: at.teacherId.teacherProfile?.rating,
      subjects: at.subjects,
      qualifications: at.teacherId.teacherProfile?.qualifications || [],
    })) || []

    return NextResponse.json(teachers)

  } catch (error) {
    console.error('[STUDENT_TEACHERS_ERROR]', error)
    return NextResponse.json(
      { error: "Failed to fetch teachers" },
      { status: 500 }
    )
  }
}
