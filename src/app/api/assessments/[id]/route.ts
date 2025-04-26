import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import authOptions from "@/lib/auth"
import { TeacherAssessment } from "@/models/assessment"
import { connectDB } from "@/lib/mongodb"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const assessment = await TeacherAssessment.findById(params.id).lean()

    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
    }

    const formatted = {
      ...assessment,
      id: assessment._id.toString(),
      _id: assessment._id.toString()
    }

    return NextResponse.json(formatted)
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
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
    const body = await req.json()

    const assessment = await TeacherAssessment.findById(params.id)
    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
    }

    if (assessment.teacherId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    // Format questions if they exist in the update
    const formattedQuestions = body.questions?.map(q => ({
      id: q.id,
      type: q.type,
      question: q.question,
      options: q.options || [],
      points: q.points,
      correctAnswer: q.correctAnswer,
      attachment: q.attachment
    }))

    const updatedAssessment = await TeacherAssessment.findByIdAndUpdate(
      params.id,
      {
        ...body,
        questions: formattedQuestions,
        points: formattedQuestions?.reduce((sum, q) => sum + (q.points || 0), 0)
      },
      { new: true }
    ).lean()

    const formatted = {
      ...updatedAssessment,
      id: updatedAssessment._id.toString(),
      _id: updatedAssessment._id.toString()
    }

    return NextResponse.json(formatted)
  } catch (error) {
    console.error("Update error:", error)
    return NextResponse.json({ error: "Update failed" }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const assessment = await TeacherAssessment.findById(params.id)
    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
    }

    // Only allow teachers to delete their own assessments
    if (assessment.teacherId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    await TeacherAssessment.findByIdAndDelete(params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[ASSESSMENT_DELETE_ERROR]", error)
    return NextResponse.json(
      { error: "Failed to delete assessment" },
      { status: 500 }
    )
  }
}
