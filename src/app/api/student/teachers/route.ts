import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/user"
import authOptions from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const student = await User.findById(session.user.id)
      .select("studentProfile.assignedTeachers")
      .populate({
        path: "studentProfile.assignedTeachers.teacherId",
        select:
          "name email phone bio language teacherProfile.subjects teacherProfile.qualifications teacherProfile.ratings"
      })
      .lean()

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    const teachers =
      student.studentProfile?.assignedTeachers?.map((at) => {
        const t = at.teacherId as any
        const prof = t.teacherProfile || {}
        return {
          id:            t._id.toString(),
          name:          t.name,
          email:         t.email,
          phone:         t.phone,
          bio:           t.bio,
          language:      t.language,
          subjects:      prof.subjects || [],
          qualifications: prof.qualifications || [],
          averageRating: prof.ratings?.average ?? 0,
          reviewCount:   prof.ratings?.count   ?? 0,
        }
      }) || []

    return NextResponse.json(teachers)
  } catch (err) {
    console.error("[STUDENT_TEACHERS_ERROR]", err)
    return NextResponse.json(
      { error: "Failed to fetch teachers" },
      { status: 500 }
    )
  }
}
