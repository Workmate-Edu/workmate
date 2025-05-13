import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import authOptions from "@/lib/auth" // Add this import
import { TeacherAssessment } from "@/models/assessment"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/user"
import { TeacherAssessmentStatus } from '@/types/assessment';
import sendEmail from "@/lib/sendSmtpMail"
import { formatDateTime } from "@/lib/timezone-utils"
import { formatAssessmentDateTime } from "@/lib/timezone-utils"

const isValidStatus = (status: any): status is TeacherAssessmentStatus => {
  return ['draft', 'active', 'submitted', 'graded'].includes(status);
};

// Helper function for consistent error handling
const handleError = (error: any) => {
  console.error('API Error:', error)
  if (error.name === 'MongooseError' && error.message.includes('connect')) {
    return NextResponse.json({ error: 'Database connection failed' }, { status: 503 })
  }
  return NextResponse.json({ 
    error: error.message || 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined 
  }, { status: 500 })
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions) // Add authOptions
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 })
    }
    
    if (session.user.role !== 'teacher') {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 })
    }

    await connectDB()

    const assessments = await TeacherAssessment.find({ teacherId: session.user.id })
      .sort({ createdAt: -1 })
      .lean()

    // Transform _id to id in response
    const formattedAssessments = assessments.map(assessment => ({
      ...assessment,
      id: assessment._id.toString(),
      _id: undefined,
      points: assessment.questions.reduce((sum, q) => sum + (q.points || 0), 0),
    }))

    return NextResponse.json(formattedAssessments)
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Get teacher info first
    const teacher = await User.findById(session.user.id)
      .select('name email')
      .lean()

    if (!teacher) {
      throw new Error('Teacher not found')
    }

    const assessmentData = await req.json()

    // Get student info
    const student = await User.findById(assessmentData.studentId)
      .select('name email studentProfile.registeredAs studentProfile.parent')
      .populate({
        path: 'studentProfile.parent',
        select: 'name email'
      })
      .lean()

    if (!student) {
      throw new Error('Student not found')
    }

    // Create assessment
    const assessment = await TeacherAssessment.create({
      ...assessmentData,
      teacherId: session.user.id
    })

    // Determine recipient (student or parent)
    const isChild = student.studentProfile?.registeredAs === 'child'
    const recipient = isChild ? student.studentProfile.parent : student

    // Send email notification
    await sendEmail({
      to: recipient.email,
      subject: `New Assessment: ${assessment.title}`,
      template: "assessment-notification",
      replacements: {
        notificationType: "New Assessment",
        recipientName: recipient.name,
        mainMessage: isChild 
          ? `A new assessment has been assigned to ${student.name} by ${teacher.name}`
          : `A new assessment has been assigned to you by ${teacher.name}`,
        title: assessment.title,
        subject: assessment.subject,
        description: assessment.description || "No description provided",
        dueDate: assessment.dueDate,
        teacherTime: `Teacher's timezone: ${assessment.timezone}`,
        totalPoints: assessment.questions.reduce((sum, q) => sum + (q.points || 0), 0),
        type: assessment.type,
        assessmentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/student/assessments/${assessment._id}`
      }
    })

    return NextResponse.json(assessment)

  } catch (error) {
    console.error("Assessment creation error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create assessment" },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions) // Add authOptions
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { id, status, answers, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: "Assessment ID is required" }, { status: 400 })
    }

    await connectDB()

    const assessment = await TeacherAssessment.findById(id)
    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
    }

    // Teacher updating draft
    if (session.user.role === 'teacher') {
      if (assessment.teacherId.toString() !== session.user.id) {
        return NextResponse.json({ error: "Not authorized to update this assessment" }, { status: 403 })
      }

      // Validate status if being updated
      if (status && !isValidStatus(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 })
      }

      const updatedAssessment = await TeacherAssessment.findByIdAndUpdate(
        id,
        { ...updateData, status: status || assessment.status },
        { new: true }
      )

      return NextResponse.json(updatedAssessment)
    }

    // Student submitting answers
    if (session.user.role === 'student') {
      if (assessment.status !== 'active') {
        return NextResponse.json({ error: "Assessment is not active" }, { status: 400 })
      }

      if (!answers || !Array.isArray(answers)) {
        return NextResponse.json({ error: "Invalid answers format" }, { status: 400 })
      }

      const submission = {
        studentId: session.user.id,
        answers: answers.map(answer => ({
          questionId: answer.questionId,
          answer: answer.answer
        })),
        submittedAt: new Date()
      }

      const updatedAssessment = await TeacherAssessment.findByIdAndUpdate(
        id,
        { 
          $push: { submissions: submission }
        },
        { new: true }
      )

      return NextResponse.json(updatedAssessment)
    }

    return NextResponse.json({ error: "Unauthorized role" }, { status: 403 })

  } catch (error) {
    console.error("[ASSESSMENT_UPDATE_ERROR]", error)
    return NextResponse.json(
      { error: "Failed to update assessment" },
      { status: 500 }
    )
  }
}
