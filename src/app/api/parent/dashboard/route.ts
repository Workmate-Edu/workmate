import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/user"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'parent') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const parent = await User.findById(session.user.id)
      .populate({
        path: 'parentProfile.children',
        select: 'name email grade gender studentProfile.subjects studentProfile.assignedTeachers',
        populate: {
          path: 'studentProfile.assignedTeachers.teacherId',
          select: 'name email'
        }
      })
      .lean()

    if (!parent?.parentProfile?.children) {
      return NextResponse.json({ children: [] })
    }

    const children = parent.parentProfile.children.map((child: any) => ({
      id: child._id,
      name: child.name,
      email: child.email,
      grade: child.studentProfile?.grade,
      gender: child.gender,
      subjects: child.studentProfile?.subjects?.map((subject: any) => {
        const teacherAssignment = child.studentProfile?.assignedTeachers
          ?.find((t: any) => t.subjects?.includes(subject.area))

        return {
          name: subject.name,
          area: subject.area,
          teacher: teacherAssignment ? {
            id: teacherAssignment.teacherId._id,
            name: teacherAssignment.teacherId.name,
            email: teacherAssignment.teacherId.email
          } : null
        }
      }) || []
    }))

    return NextResponse.json({ children })

  } catch (error) {
    console.error('[PARENT_DASHBOARD_ERROR]', error)
    return NextResponse.json(
      { error: "Failed to fetch children" },
      { status: 500 }
    )
  }
}
