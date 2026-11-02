import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/user"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'pending'

    const verifications = await User.find({
      role: 'teacher',
      'teacherProfile.verificationStatus': status
    })
    .select('name email teacherProfile.qualifications teacherProfile.subjects')
    .sort({ updatedAt: -1, createdAt: -1 })
    .lean()

    return NextResponse.json({ verifications })
  } catch (error) {
    console.error('[TEACHER_VERIFICATIONS_GET]', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
