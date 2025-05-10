import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { ChildAssessment } from "@/models/child-assessment"
import { User } from "@/models/user"

export async function GET(
  req: Request,
  { params }: { params: { studentId: string } }
) {
  try {
    await connectDB()
    console.log('Finding child assessment for studentId:', params.studentId)

    // First try to find the user to get the correct childId
    const user = await User.findById(params.studentId).lean()
    console.log('Found user:', user ? 'yes' : 'no')

    // Try multiple ways to find the assessment
    const assessment = await ChildAssessment.findOne({
      $or: [
        { childId: params.studentId },
        { childId: user?._id },
        { 'data.studentId': params.studentId },
        { parentId: user?.parent }
      ]
    }).lean()

    console.log('Assessment found:', assessment ? 'yes' : 'no')
    if (assessment) {
      console.log('Assessment details:', {
        id: assessment._id,
        childId: assessment.childId,
        type: assessment.type,
        createdAt: assessment.createdAt
      })
    } else {
      // Log all child assessments for debugging
      const allAssessments = await ChildAssessment.find({}).lean()
      console.log('All child assessments:', allAssessments.map(a => ({
        id: a._id,
        childId: a.childId
      })))
    }

    return NextResponse.json({ 
      assessment,
      debug: {
        queriedId: params.studentId,
        foundUserId: user?._id,
        parentId: user?.parent
      }
    })

  } catch (error) {
    console.error('Child assessment error:', error)
    return NextResponse.json({ 
      error: "Failed to fetch child assessment",
      details: error.message 
    }, { 
      status: 500 
    })
  }
}
