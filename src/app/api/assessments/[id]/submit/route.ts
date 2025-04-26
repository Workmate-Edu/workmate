import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { TeacherAssessment } from "@/models/assessment"
import { connectDB } from "@/lib/mongodb"
import authOptions from "@/lib/auth"

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const { answers } = await req.json()

    const assessment = await TeacherAssessment.findById(params.id)
    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
    }

    const submission = {
      studentId: session.user.id,
      answers: Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer
      })),
      submittedAt: new Date()
    }

    assessment.status = 'submitted'
    assessment.submissions.push(submission)
    await assessment.save()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to submit assessment" },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const { answers } = await req.json()

    const assessment = await TeacherAssessment.findById(params.id)
    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
    }

    // Check if assessment can be updated
    const dueDate = new Date(assessment.dueDate)
    const now = new Date()
    if (now > dueDate) {
      return NextResponse.json({ error: "Assessment is overdue" }, { status: 400 })
    }

    if (assessment.status === 'graded') {
      return NextResponse.json({ error: "Cannot update graded assessment" }, { status: 400 })
    }

    // Update or create submission
    const submissionIndex = assessment.submissions.findIndex(
      (s: any) => s.studentId.toString() === session.user.id
    )

    const submission = {
      studentId: session.user.id,
      answers: answers.map((answer: any) => ({
        questionId: answer.questionId,
        answer: answer.answer
      })),
      submittedAt: new Date()
    }

    if (submissionIndex >= 0) {
      // Update existing submission
      assessment.submissions[submissionIndex] = submission
    } else {
      // Add new submission
      assessment.submissions.push(submission)
    }

    assessment.status = 'submitted'
    await assessment.save()

    return NextResponse.json({ 
      success: true,
      submission: submission
    })
  } catch (error) {
    console.error('Update submission error:', error)
    return NextResponse.json(
      { error: "Failed to update submission" },
      { status: 500 }
    )
  }
}
