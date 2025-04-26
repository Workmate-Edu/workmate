import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { connectDB } from "@/lib/mongodb"
import { InitialAssessment } from "@/models/initial-assessment"
import authOptions from "@/lib/auth"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const assessment = await InitialAssessment.findById(params.id)
    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
    }

    if (assessment.studentId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json(assessment)
  } catch (error) {
    console.error("[ASSESSMENT_GET_ERROR]", error)
    return NextResponse.json(
      { error: "Failed to fetch assessment" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const assessment = await InitialAssessment.findById(params.id)
    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
    }

    if (assessment.studentId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (assessment.status === 'assigned') {
      return NextResponse.json(
        { error: "Cannot edit assigned assessment" },
        { status: 400 }
      )
    }

    const body = await req.json()
    
    // Update responses
    assessment.responses = Object.entries(body.answers).map(([questionId, answer]) => ({
      questionId,
      answer,
      timestamp: new Date()
    }))

    await assessment.save()

    return NextResponse.json(assessment)
  } catch (error) {
    console.error("[ASSESSMENT_UPDATE_ERROR]", error)
    return NextResponse.json(
      { error: "Failed to update assessment" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Find assessment and check ownership
    const assessment = await InitialAssessment.findById(params.id)
    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
    }

    if (assessment.studentId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Don't allow deletion of assigned assessments
    if (assessment.status === 'assigned') {
      return NextResponse.json(
        { error: "Cannot delete assigned assessment" },
        { status: 400 }
      )
    }

    await assessment.deleteOne()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[ASSESSMENT_DELETE_ERROR]", error)
    return NextResponse.json(
      { error: "Failed to delete assessment" },
      { status: 500 }
    )
  }
}
