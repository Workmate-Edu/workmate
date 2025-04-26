import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectDB } from "@/lib/mongodb"
import { findEligibleTeachers } from "@/lib/services/teacher-eligibility"
import authOptions from "@/lib/auth"

export async function GET(req: Request) {
  try {
    // Add auth check
    const session = await getServerSession(authOptions)
    if (!session?.user?.role === 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const subjectsParam = searchParams.get('subjects')

    if (!subjectsParam) {
      return NextResponse.json(
        { error: "Subjects parameter is required" }, 
        { status: 400 }
      )
    }

    let subjects
    try {
      subjects = JSON.parse(subjectsParam)
      if (!Array.isArray(subjects)) throw new Error()
    } catch {
      return NextResponse.json(
        { error: "Invalid subjects format" }, 
        { status: 400 }
      )
    }

    await connectDB()
    const eligibleTeachers = await findEligibleTeachers(subjects)

    return NextResponse.json({
      teachers: eligibleTeachers,
      totalMatches: eligibleTeachers.length,
      searchCriteria: {
        requiredSubjects: subjects
      }
    })

  } catch (error) {
    console.error('[ELIGIBLE_TEACHERS_ERROR]', error)
    return NextResponse.json({ 
      error: "Failed to fetch eligible teachers",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}
