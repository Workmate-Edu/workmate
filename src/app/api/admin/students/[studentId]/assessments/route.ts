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
    // Log the incoming request
    console.log('Fetching assessments for student:', params.studentId)

    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Debug log before queries
    console.log('Debug info:', {
      studentId: params.studentId,
    })

    // Query child assessment first to verify
    const childAssessment = await ChildAssessment.findOne({ 
      childId: params.studentId 
    }).lean()

    console.log('Found child assessment:', childAssessment ? 'yes' : 'no')

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

    // Debug log assessment counts
    console.log('Assessment counts:', {
      initial: initialAssessments.length,
      child: childAssessments.length
    })

    // Log full child assessments for debugging
    console.log('Child Assessments:', JSON.stringify(childAssessments, null, 2))

    const response = {
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
          submittedAt: a.createdAt,
          responses: a.responses || []
        }))
      }
    }

    // Log final response
    console.log('Sending response:', JSON.stringify(response, null, 2))

    return NextResponse.json(response)

  } catch (error) {
    console.error('[STUDENT_ASSESSMENTS_ERROR]', error)
    return NextResponse.json({ 
      error: "Failed to fetch assessments",
      details: error.message
    }, { status: 500 })
  }
}
