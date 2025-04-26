import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/user"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'admin') { // Fix the condition
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'pending'

    const teachers = await User.find({
      role: 'teacher',
      'teacherProfile.verificationStatus': status
    })
    .select('name email bio phone teacherProfile')
    .lean()

    console.log(`Found ${teachers.length} teachers with status: ${status}`)

    return NextResponse.json({ 
      success: true,
      teachers: teachers || [] // Ensure we always return an array
    })
  } catch (error) {
    console.error('[TEACHERS_GET_ERROR]', error)
    return NextResponse.json({ 
      success: false,
      error: "Internal server error",
      teachers: [] // Return empty array on error
    }, { status: 500 })
  }
}
