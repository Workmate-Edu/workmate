import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/user"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const subject = searchParams.get('subject')

    await connectDB()
    
    const query = {
      role: 'teacher',
      'teacherProfile.subjects': subject,
      'teacherProfile.isAvailable': true
    }

    const teachers = await User
      .find(query)
      .select('name email teacherProfile')
      .lean()

    return NextResponse.json(teachers)
  } catch (error) {
    console.error("[TEACHERS_LIST_ERROR]", error)
    return NextResponse.json(
      { error: "Failed to fetch teachers" },
      { status: 500 }
    )
  }
}
