import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/user"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    await connectDB()
    
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')?.toLowerCase() || ''
    let query = {}

    if (session.user.role === 'teacher') {
      // Get assigned students for teacher
      const teacher = await User.findById(session.user.id)
        .select('teacherProfile.subjects')

      query = {
        role: 'student',
        'studentProfile.subjects': {
          $elemMatch: {
            $or: teacher.teacherProfile.subjects.map((area: any) => ({
              area: area.area,
              name: { $in: area.subjects }
            }))
          }
        }
      }
    } else if (session.user.role === 'student') {
      // Get teachers for student's subjects
      const student = await User.findById(session.user.id)
        .select('studentProfile.subjects')

      query = {
        role: 'teacher',
        'teacherProfile.subjects': {
          $elemMatch: {
            $or: student.studentProfile.subjects.map((s: any) => ({
              area: s.area,
              subjects: s.name
            }))
          }
        }
      }
    }

    if (search) {
      query = {
        ...query,
        $or: [
          { name: new RegExp(search, 'i') },
          { email: new RegExp(search, 'i') }
        ]
      }
    }

    const users = await User.find(query)
      .select('name email role studentProfile.grade teacherProfile.subjects')
      .limit(20)

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
