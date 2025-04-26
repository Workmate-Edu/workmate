import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { StudentProgress } from "@/models/student-progress"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Get all progress entries for the student
    const progressEntries = await StudentProgress.find({ 
      studentId: session.user.id 
    })
    .sort({ updatedAt: -1 })
    .lean()

    // Group by subject and take latest entry
    const subjectMap = new Map()
    progressEntries.forEach(entry => {
      if (!subjectMap.has(entry.subjectId)) {
        subjectMap.set(entry.subjectId, {
          _id: entry.subjectId,
          name: entry.subjectId.split('-')[1] || entry.subjectId,
          area: entry.subjectId.split('-')[0] || 'General',
          scores: entry.scores,
          averageScore: entry.averageScore,
          updatedAt: entry.updatedAt,
          teacherId: entry.teacherId
        })
      }
    })

    const formattedSubjects = Array.from(subjectMap.values())
    return NextResponse.json(formattedSubjects)

  } catch (error) {
    console.error('[STUDENT_SUBJECTS_ERROR]', error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
