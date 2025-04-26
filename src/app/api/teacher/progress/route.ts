import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { StudentProgress } from "@/models/student-progress"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'teacher') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()
    await connectDB()

    const progress = await StudentProgress.create({
      ...data,
      teacherId: session.user.id
    })

    // Send email notification to parent
    // TODO: Implement email notification

    return NextResponse.json(progress)
  } catch (error) {
    console.error('[PROGRESS_CREATE_ERROR]', error)
    return NextResponse.json({ error: "Failed to save progress" }, { status: 500 })
  }
}
