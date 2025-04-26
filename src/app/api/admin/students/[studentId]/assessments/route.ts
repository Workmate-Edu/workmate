import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectDB } from "@/lib/mongodb"
import { InitialAssessment } from "@/models/initial-assessment"
import { ChildAssessment } from "@/models/child-assessment"
import authOptions from "@/lib/auth"

export async function GET(
  req: Request,
  { params }: { params: { studentId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const [initialAssessments, childAssessments] = await Promise.all([
      InitialAssessment.find({ 
        studentId: params.studentId 
      })
      .sort({ createdAt: -1 })
      .lean(),

      ChildAssessment.find({ 
        childId: params.studentId 
      })
      .sort({ createdAt: -1 })
      .lean()
    ])

    return NextResponse.json({
      assessments: {
        initial: initialAssessments.map(a => ({
          _id: a._id,
          type: 'initial',
          status: a.status,
          subject: a.subject,
          submittedAt: a.submittedAt || a.createdAt,
          responses: [{
            category: "Initial Assessment",
            questions: a.responses[0]?.questions.map(q => ({
              question: q.question,
              answer: q.answer
            })) || []
          }]
        })),
        child: childAssessments.map(a => ({
          _id: a._id,
          type: 'parent_questionnaire',
          status: a.status,
          submittedAt: a.submittedAt || a.createdAt,
          responses: a.responses || []
        }))
      }
    })

  } catch (error) {
    console.error('[STUDENT_ASSESSMENTS_ERROR]', error)
    return NextResponse.json({ 
      error: "Failed to fetch assessments",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}
