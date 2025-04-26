import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { StudentProgress } from "@/models/student-progress"

export async function GET(
  req: Request,
  { params }: { params: { childId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'parent') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const progress = await StudentProgress.find({ studentId: params.childId })
      .populate('teacherId', 'name email')
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json(progress)

  } catch (error) {
    console.error('[GET_STUDENT_PROGRESS_ERROR]', error)
    return NextResponse.json(
      { error: "Failed to fetch student progress" },
      { status: 500 }
    )
  }
}
