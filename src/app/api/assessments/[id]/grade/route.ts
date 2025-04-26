import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { TeacherAssessment } from "@/models/assessment"
import { connectDB } from "@/lib/mongodb"
import authOptions from "@/lib/auth"

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'teacher') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const { grades, feedback } = await req.json()

    const assessment = await TeacherAssessment.findById(params.id)
    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
    }

    if (!assessment.submissions?.length) {
      return NextResponse.json({ error: "No submission to grade" }, { status: 400 })
    }

    // Update submission grades
    const submission = assessment.submissions[0]
    submission.answers = submission.answers.map((answer: any) => ({
      ...answer,
      grade: grades[answer.questionId] || 0
    }))

    // Calculate total points
    const totalPoints = Object.values(grades).reduce((sum: number, grade: number) => sum + grade, 0)
    
    // Update assessment
    assessment.status = 'graded'
    assessment.feedback = feedback
    assessment.grade = totalPoints
    assessment.gradedAt = new Date()

    await assessment.save()

    return NextResponse.json({
      success: true,
      grade: totalPoints,
      feedback
    })
  } catch (error) {
    console.error('Grading error:', error)
    return NextResponse.json(
      { error: "Failed to grade assessment" },
      { status: 500 }
    )
  }
}
