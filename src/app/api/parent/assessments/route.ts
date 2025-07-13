import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import authOptions from "@/lib/auth"
import { TeacherAssessment } from "@/models/assessment"
import { connectDB } from "@/lib/mongodb"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    // Find assessments where this student is the target student
    const assessments = await TeacherAssessment.find({ 
      studentId: session.user.id,
      status: { $ne: 'draft' } // Exclude drafts
    }).lean()

    console.log('Debug info:', {
      studentId: session.user.id,
      foundAssessments: assessments.length,
      assessmentIds: assessments.map(a => a._id)
    })

    const formattedAssessments = assessments.map(assessment => ({
      ...assessment,
      id: assessment._id.toString(),
      _id: undefined
    }))

    return NextResponse.json(formattedAssessments)
  } catch (error) {
    console.error('Error fetching student assessments:', error)
    return NextResponse.json(
      { error: "Failed to fetch assessments" }, 
      { status: 500 }
    )
  }
}
