import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Types } from "mongoose"
import { ChildAssessment, ChildAssessmentDocument } from "@/models/child-assessment.model"

interface StudentAssessment extends Omit<ChildAssessmentDocument, '_id'> {
  _id: Types.ObjectId
  studentId: {
    name: string
    email: string
    _id: Types.ObjectId
  }
}

export async function GET() {
  try {
    await connectDB()

    const assessments = await ChildAssessment
      .find()
      .populate('studentId', 'name email')
      .lean()

    return NextResponse.json({
      assessments: (assessments as any[]).map(a => ({
        ...a,
        _id: new Types.ObjectId(a._id).toString(),
        student: {
          name: a.studentId?.name,
          email: a.studentId?.email,
          id: new Types.ObjectId(a.studentId?._id).toString()
        }
      }))
    })
  } catch (error) {
    console.error('Error fetching student assessments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assessments' },
      { status: 500 }
    )
  }
}
