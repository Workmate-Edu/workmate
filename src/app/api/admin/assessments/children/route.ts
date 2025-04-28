import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { ChildAssessment, type ChildAssessmentDocument } from "@/models/child-assessment.model"
import { connectDB } from "@/lib/mongodb"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const assessments = await ChildAssessment.find({ 
      status: 'pending' 
    })
    .lean()
    .exec()

    return NextResponse.json(
      (assessments as ChildAssessmentDocument[]).map(doc => ({
        id: doc._id.toString(),
        status: doc.status,
        createdAt: doc.createdAt,
        responses: doc.responses.map(r => ({
          category: r.category,
          questions: r.questions.map(q => ({
            question: q.question,
            answer: q.answer,
            score: q.score
          }))
        }))
      }))
    )
  } catch (error) {
    console.error('Error fetching assessments:', error)
    return NextResponse.json(
      { error: "Failed to fetch assessments" },
      { status: 500 }
    )
  }
}
