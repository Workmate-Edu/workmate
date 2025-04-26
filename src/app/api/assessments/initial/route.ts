import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectDB } from "@/lib/mongodb"
import { InitialAssessment } from "@/models/initial-assessment"
import authOptions from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    
    // Validate request body
    if (!body.subject?.name || !body.subject?.area || !body.responses?.length) {
      return NextResponse.json({ 
        error: "Invalid request data",
        details: "Subject and responses are required" 
      }, { status: 400 })
    }

    await connectDB()

    const assessment = await InitialAssessment.create({
      type: 'initial',
      studentId: session.user.id,
      subject: body.subject,
      responses: body.responses,
      status: 'pending',
      submittedAt: new Date()
    })

    return NextResponse.json(assessment)

  } catch (error) {
    console.error("[INITIAL_ASSESSMENT_ERROR]", error)
    return NextResponse.json({ 
      error: "Internal server error",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'all'

    let assessments = [];

    if (type === 'all' || type === 'student') {
      const studentAssessments = await Assessment.find({
        type: 'initial',
        status: 'pending'
      })
      .populate('student', 'name grade subjects')
      .select('-responses')
      .lean();

      assessments.push(...studentAssessments.map(a => ({
        ...a,
        assessmentType: 'student'
      })));
    }

    if (type === 'all' || type === 'child') {
      const childAssessments = await ChildAssessment.find({
        status: 'pending'
      })
      .populate('child', 'name grade subjects')
      .populate('parent', 'name')
      .select('-responses')
      .lean();

      assessments.push(...childAssessments.map(a => ({
        ...a,
        assessmentType: 'child'
      })));
    }

    // Sort by creation date
    assessments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(assessments);

  } catch (error) {
    console.error('[ASSESSMENTS_GET]', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
