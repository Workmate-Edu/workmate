import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { StudentProgress } from "@/models/student-progress"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const subjectId = searchParams.get('subjectId')

    if (!subjectId) {
      return NextResponse.json({ error: "Subject ID required" }, { status: 400 })
    }

    await connectDB()

    const latestProgress = await StudentProgress.findOne({
      studentId: session.user.id,
      subjectId
    })
    .sort({ createdAt: -1 })
    .lean()

    return NextResponse.json({ latestProgress })

  } catch (error) {
    console.error('[STUDENT_PROGRESS]', error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
