import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import authOptions from "@/lib/auth" // Add this import
import { TeacherAssessment } from "@/models/assessment"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/user"
import { TeacherAssessmentStatus } from '@/types/assessment';
import mongoose from 'mongoose';

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

export async function GET(req: NextRequest) {
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
      _id: undefined
    }))

    return NextResponse.json(formattedAssessments)
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions) // Add authOptions
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 })
    }

    if (session.user.role !== 'teacher') {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 })
    }

    await connectDB()
    const body = await req.json()

    console.log('Received body:', body)

    // Create assessment data with explicit studentId
    const assessmentData = {
      title: body.title,
      description: body.description,
      type: body.type || 'assignment',
      teacherId: session.user.id,
      studentId: body.studentId,  // Ensure this is included
      subject: body.subject,
      status: body.status,
      dueDate: new Date(body.dueDate),
      questions: body.questions?.map(q => ({
        id: q.id,
        type: q.type,
        question: q.question,
        options: q.options || [],
        points: q.points,
        correctAnswer: q.correctAnswer
      }))
    }

    console.log('Creating with:', assessmentData)
    
    const assessment = await TeacherAssessment.create(assessmentData)

    // Format response to include all fields
    const formatted = {
      ...assessment.toObject(), // Use toObject() instead of toJSON()
      id: assessment._id.toString(),
      studentId: assessment.studentId.toString(), // Explicitly include studentId
      _id: undefined
    }

    console.log('Response:', formatted)

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Assessment creation error:', error) // Debug log
    return handleError(error)
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
