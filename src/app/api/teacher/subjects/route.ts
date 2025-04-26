import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/user"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'teacher') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const teacher = await User.findById(session.user.id)
      .select('teacherProfile.subjects')
      .lean()

    if (!teacher?.teacherProfile?.subjects) {
      return NextResponse.json([])
    }

    // Format subjects for the dropdown
    const formattedSubjects = teacher.teacherProfile.subjects.flatMap(area => 
      area.subjects.map(subject => ({
        id: `${subject}-${area.area}`,
        name: subject,
        area: area.area
      }))
    )

    return NextResponse.json(formattedSubjects)

  } catch (error) {
    console.error('[TEACHER_SUBJECTS_GET]', error)
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 }
    )
  }
}
