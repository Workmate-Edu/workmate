import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { TeachingSession } from "@/models/teaching-session"
import { Assessment } from "@/models/assessment" // Assuming you have this model

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'student') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Get recent sessions
    const recentSessions = await TeachingSession.find({
      studentId: session.user.id
    })
    .sort({ startTime: -1 })
    .limit(5)
    .populate('teacherId', 'name')
    .lean()

    // Get recent assessments
    const recentAssessments = await Assessment.find({
      studentId: session.user.id
    })
    .sort({ completedAt: -1 })
    .limit(5)
    .lean()

    // Combine and format activities
    const activities = [
      ...recentSessions.map(session => ({
        type: 'session_scheduled',
        title: 'Class Session Scheduled',
        subject: session.subject.name,
        date: session.startTime,
        details: `with ${session.teacherId.name}`
      })),
      ...recentAssessments.map(assessment => ({
        type: 'assessment',
        title: assessment.type === 'initial' ? 'Completed Initial Assessment' : 'Assessment Completed',
        subject: assessment.subject,
        date: assessment.completedAt,
        details: `Score: ${assessment.score}%`
      }))
    ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)

    return NextResponse.json(activities)

  } catch (error) {
    console.error('[GET_ACTIVITIES_ERROR]', error)
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    )
  }
}
