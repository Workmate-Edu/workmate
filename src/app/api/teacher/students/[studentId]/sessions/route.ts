import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { TeachingSession } from "@/models/teaching-session"

export async function GET(
  req: Request,
  { params }: { params: { studentId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const sessions = await TeachingSession.find({
      teacherId: session.user.id,
      studentId: params.studentId
    })
    .sort({ startTime: -1 })
    .lean()

    return NextResponse.json(sessions)

  } catch (error) {
    console.error('[GET_STUDENT_SESSIONS_ERROR]', error)
    return NextResponse.json(
      { error: "Failed to fetch sessions" }, 
      { status: 500 }
    )
  }
}
