import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectDB } from "@/lib/mongodb"
import { Child } from "@/models/child"
import { ChildAssessment } from "@/models/child-assessment"
import authOptions from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const assessments = await ChildAssessment.find({
      status: 'pending'
    })
    .populate({
      path: 'childId',
      select: 'name grade subjects parent',
      populate: {
        path: 'parent',
        select: 'name email'
      }
    })
    .lean()

    console.log('Found pending child assessments:', {
      count: assessments.length,
      example: assessments[0] ? {
        id: assessments[0]._id,
        childName: assessments[0].childId?.name,
        hasResponses: !!assessments[0].responses?.length
      } : null
    })

    const formattedAssessments = assessments
      .filter(assessment => assessment.childId && assessment.responses?.length > 0)
      .map(assessment => ({
        _id: assessment._id,
        child: {
          id: assessment.childId._id,
          name: assessment.childId?.name,
          grade: assessment.childId?.grade,
          subjects: assessment.childId?.subjects || []
        },
        parent: {
          name: assessment.childId?.parent?.name,
          email: assessment.childId?.parent?.email
        },
        status: assessment.status,
        createdAt: assessment.createdAt,
        responses: assessment.responses.map(r => ({
          category: r.category,
          questions: r.questions.map(q => ({
            question: q.question,
            answer: Array.isArray(q.answer) ? q.answer.join('') : q.answer,
            notes: q.notes || ''
          }))
        }))
      }))

    return NextResponse.json({ assessments: formattedAssessments })
  } catch (error) {
    console.error('[CHILD_ASSESSMENTS_GET]', error)
    return NextResponse.json(
      { error: "Failed to fetch child assessments", details: error.message },
      { status: 500 }
    )
  }
}
