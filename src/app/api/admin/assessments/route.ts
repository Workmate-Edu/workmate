import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectDB } from "@/lib/mongodb"
import { InitialAssessment } from "@/models/initial-assessment"
import { ChildAssessment } from "@/models/child-assessment"
import { User } from "@/models/user"
import authOptions from "@/lib/auth"

interface Question {
  question: string;
  answer: string | string[];
  level?: string;
}

// Add these exports to fix dynamic usage
export const runtime = 'nodejs' // Add this line for MongoDB usage
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const [initialAssessments, childAssessments] = await Promise.all([
      InitialAssessment.find({ status: 'draft' })
        .populate('studentId', 'name email grade studentProfile.subjects')
        .lean(),

      ChildAssessment.find({ status: 'draft' })
        .populate({
          path: 'childId',
          model: 'User',
          select: 'name grade studentProfile.parent studentProfile.subjects',
          populate: {
            path: 'studentProfile.parent',
            model: 'User',
            select: 'name email'
          }
        })
        .lean()
    ])

    return NextResponse.json({
      assessments: {
        initial: initialAssessments.map(a => ({
          _id: a._id,
          type: 'initial',
          status: a.status,
          studentId: {
            id: a.studentId?._id,
            name: a.studentId?.name || "Unknown",
            email: a.studentId?.email || "N/A",
            grade: a.studentId?.grade || "N/A"
          },
          student: {
            name: a.studentId?.name || "Unknown",
            email: a.studentId?.email || "N/A",
            grade: a.studentId?.grade || "N/A"
          },
          subject: a.subject,
          submittedAt: a.submittedAt || a.createdAt || a.updatedAt,
          responses: [{
            category: "Initial Assessment",
            questions: a.responses[0]?.questions.map((q: Question) => ({
              question: q.question,
              answer: q.answer,
              level: q.answer
            })) || []
          }]
        })),
        child: childAssessments.map(a => ({
          _id: a._id,
          type: 'parent_questionnaire',
          status: a.status,
          child: {
            id: a.childId?._id,
            name: a.childId?.name || "Unknown Child",
            grade: a.childId?.grade || "N/A",
            subjects: a.childId?.studentProfile?.subjects || []
          },
          student: {
            name: a.childId?.name || "Unknown Child",
            email: "N/A",
            grade: a.childId?.grade || "N/A"
          },
          parent: {
            name: a.childId?.studentProfile?.parent?.name || "N/A",
            email: a.childId?.studentProfile?.parent?.email || "N/A"
          },
          submittedAt: a.submittedAt || a.createdAt || a.updatedAt,
          responses: a.responses || []
        }))
      }
    })

  } catch (error) {
    console.error('[ASSESSMENTS_GET_ERROR]', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ 
      error: "Failed to fetch assessments",
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 })
  }
}
