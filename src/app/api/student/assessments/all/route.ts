import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectDB } from "@/lib/mongodb"
import { InitialAssessment } from "@/models/initial-assessment"
import authOptions from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const assessments = await InitialAssessment.find({ 
      status: 'pending'  // Only get pending assessments
    })
    .populate('studentId', 'name email') // Get student details
    .lean()

    // Transform the data to match expected format
    const formattedAssessments = assessments.map(assessment => ({
      ...assessment,
      student: assessment.studentId,
      completedAt: assessment.createdAt,
      _id: assessment._id.toString()
    }))

    return NextResponse.json(formattedAssessments)
  } catch (error) {
    console.error("[ADMIN_STUDENT_ASSESSMENTS_ERROR]", error)
    return NextResponse.json(
      { error: "Failed to fetch student assessments" },
      { status: 500 }
    )
  }
}
