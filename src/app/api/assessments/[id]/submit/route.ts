import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { TeacherAssessment } from "@/models/assessment"
import { connectDB } from "@/lib/mongodb"
import authOptions from "@/lib/auth"

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const { answers } = await req.json()

    const assessment = await TeacherAssessment.findById(params.id)
    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
    }

    const processedAnswers = Object.entries(answers).map(([questionId, answer]: [string, any]) => ({
      questionId,
      answer: answer.text || answer,
      attachments: answer.attachments?.map((attachment: any) => ({
        name: attachment.name,
        type: attachment.type,
        size: attachment.size,
        url: attachment.url,
        publicId: extractPublicId(attachment.url)
      })) || []
    }))

    const submission = {
      studentId: session.user.id,
      answers: processedAnswers,
      submittedAt: new Date()
    }

    assessment.status = 'submitted'
    assessment.submissions.push(submission)
    await assessment.save()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to submit assessment" },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const { answers } = await req.json()
    console.log('Processing submission:', answers)

    const assessment = await TeacherAssessment.findById(params.id)
    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
    }

    // Format answers with attachments
    const processedAnswers = answers.map((answer: any) => {
      // Log each answer being processed
      console.log('Processing answer:', answer)
      
      return {
        questionId: answer.questionId,
        answer: answer.answer,
        attachments: answer.attachments ? answer.attachments.map((att: any) => ({
          name: att.name,
          type: att.type,
          size: att.size,
          url: att.url,
          publicId: att.publicId
        })) : []
      }
    })

    // Create new submission document
    const submissionData = {
      studentId: session.user.id,
      answers: processedAnswers,
      submittedAt: new Date()
    }

    // Find existing submission
    const submissionIndex = assessment.submissions.findIndex(
      (s: any) => s.studentId.toString() === session.user.id
    )

    // Update or create submission
    if (submissionIndex >= 0) {
      // Update existing submission
      assessment.submissions[submissionIndex] = {
        ...assessment.submissions[submissionIndex].toObject(),
        answers: processedAnswers,
        submittedAt: new Date()
      }
    } else {
      // Add new submission
      assessment.submissions.push(submissionData)
    }

    // Mark the submissions array as modified
    assessment.markModified('submissions')
    assessment.status = 'submitted'

    // Save and get updated assessment
    const updatedAssessment = await assessment.save()

    // Log final submission
    console.log('Final submission saved:', JSON.stringify(submissionData, null, 2))

    return NextResponse.json({ 
      success: true,
      assessment: {
        ...updatedAssessment.toObject(),
        id: updatedAssessment._id.toString(),
        submissions: updatedAssessment.submissions.map((sub: any) => ({
          ...sub.toObject(),
          studentId: sub.studentId.toString()
        }))
      },
      submission: submissionData
    })

  } catch (error) {
    console.error('Submission error:', error)
    return NextResponse.json(
      { error: "Failed to update submission" },
      { status: 500 }
    )
  }
}

// Helper function to extract publicId from Cloudinary URL
function extractPublicId(url: string): string {
  if (!url) return '';
  
  try {
    // Extract the path after /upload/
    const matches = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
    if (matches && matches[1]) {
      // Remove any query parameters
      return matches[1].split('?')[0];
    }
    return '';
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return '';
  }
}
