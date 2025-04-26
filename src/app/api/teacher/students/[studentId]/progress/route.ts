import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { StudentProgress } from "@/models/student-progress"

export async function GET(
  req: Request,
  { params }: { params: { studentId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const subjectId = searchParams.get('subjectId')

    await connectDB()

    const latestProgress = await StudentProgress.findOne({
      studentId: params.studentId,
      subjectId,
      teacherId: session.user.id
    }).sort({ createdAt: -1 }).lean()

    return NextResponse.json({ latestProgress })

  } catch (error) {
    console.error('[GET_PROGRESS_ERROR]', error)
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 })
  }
}

export async function POST(
  req: Request,
  { params }: { params: { studentId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { understanding, participation, homework, notes, subjectId } = body

    await connectDB()

    const progress = await StudentProgress.create({
      studentId: params.studentId,
      teacherId: session.user.id,
      subjectId,
      scores: {
        understanding,
        participation,
        homework
      },
      notes,
      weekNumber: Math.ceil((Date.now() - new Date().getTimezoneOffset() * 60000) / (7 * 24 * 60 * 60 * 1000))
    })

    return NextResponse.json(progress)

  } catch (error) {
    console.error('[CREATE_PROGRESS_ERROR]', error)
    return NextResponse.json({ error: "Failed to create progress" }, { status: 500 })
  }
}
