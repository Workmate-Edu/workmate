import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/user"
import { getAuthSession } from '@/lib/auth';
import { approvedTeacherFilter } from '@/lib/teacher-shortlist';

export const runtime = 'nodejs'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user || !['admin', 'parent', 'student'].includes(session.user.role)) return NextResponse.json({ error: 'Sign in to view teacher profiles' }, { status: 403 });
    await connectDB()

    const teacher = await User.findOne({ ...approvedTeacherFilter, _id: params.id })
      .select('name bio teacherProfile.bio teacherProfile.subjects teacherProfile.ratings')
      .lean()

    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher not found" }, 
        { status: 404 }
      )
    }

    return NextResponse.json(teacher)

  } catch (error) {
    console.error('[TEACHER_GET_ERROR]', error)
    return NextResponse.json(
      { error: "Failed to fetch teacher details" },
      { status: 500 }
    )
  }
}
