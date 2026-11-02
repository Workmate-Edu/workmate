import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/user"
import { getAuthSession } from '@/lib/auth';
import { approvedTeacherFilter, teachesSubject } from '@/lib/teacher-shortlist';

export async function GET(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user || !['admin', 'parent', 'student'].includes(session.user.role)) return NextResponse.json({ error: 'Sign in to browse teachers' }, { status: 403 });
    const { searchParams } = new URL(req.url)
    const subject = searchParams.get('subject')

    await connectDB()
    
    const teachers: any[] = await User.find(approvedTeacherFilter).select('name bio teacherProfile.bio teacherProfile.subjects').lean();
    return NextResponse.json(teachers
      .filter(teacher => !subject || teachesSubject(teacher, subject))
      .map(teacher => ({ id: String(teacher._id), name: teacher.name, bio: teacher.teacherProfile?.bio || teacher.bio || '', subjects: teacher.teacherProfile?.subjects || [] })))
  } catch (error) {
    console.error("[TEACHERS_LIST_ERROR]", error)
    return NextResponse.json(
      { error: "Failed to fetch teachers" },
      { status: 500 }
    )
  }
}
