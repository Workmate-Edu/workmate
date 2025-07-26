import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/user"

export const runtime = 'nodejs'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    const teacher = await User.findById(params.id)
      .select('name bio teacherProfile.qualifications teacherProfile.subjects teacherProfile.ratings')
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
