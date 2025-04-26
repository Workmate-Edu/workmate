import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/user";
import { ChildAssessment } from "@/models/child-assessment";
import { submitAssessment } from "@/lib/services/assessment-service";

export async function GET(
  req: Request,
  { params }: { params: { childId: string } }
) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'parent') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const child = await User.findOne({
      _id: params.childId,
      role: 'student',
      'studentProfile.registeredAs': 'child',
      'studentProfile.parent': session.user.id,
    }).select('studentProfile.assessments').lean();

    if (!child) {
      return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    const latestAssessment = await ChildAssessment.findOne({
      childId: params.childId,
      parentId: session.user.id,
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      assessment: latestAssessment || null,
      canCreateNew: !latestAssessment || (!Array.isArray(latestAssessment) && latestAssessment.status === 'completed'),
    });
  } catch (error) {
    console.error("[ASSESSMENT_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { childId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "parent") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { responses } = await req.json();

    if (!responses || !Array.isArray(responses)) {
      return NextResponse.json(
        {
          error: "Invalid responses format",
          details: "Responses must be an array",
        },
        { status: 400 }
      );
    }

    const result = await submitAssessment({
      type: "parent_questionnaire",
      studentId: params.childId,
      parentId: session.user.id,
      responses,
    });

    return NextResponse.json({
      success: true,
      assessmentId: result.assessmentId,
    });
  } catch (error: any) {
    console.error("[ASSESSMENT_POST_ERROR]", error);

    if (error.code === 112 || error?.errorLabels?.includes("TransientTransactionError")) {
      return NextResponse.json(
        { error: "Please try again", retryable: true },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to submit assessment",
        details: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { childId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "parent") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { responses } = await req.json();
    if (!responses || !Array.isArray(responses)) {
      return NextResponse.json(
        { error: "Invalid responses format" },
        { status: 400 }
      );
    }

    await connectDB();

    const assessment = await ChildAssessment.findOne({
      childId: params.childId,
      parentId: session.user.id,
    }).sort({ createdAt: -1 });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    const updatedAssessment = await ChildAssessment.findByIdAndUpdate(
      assessment._id,
      {
        $set: {
          responses,
          updatedAt: new Date(),
          status: "pending",
        },
      },
      { new: true }
    ).lean();

    await User.findByIdAndUpdate(params.childId, {
      $set: {
        'studentProfile.assessmentStatus': 'pending',
        'studentProfile.assessments.$[elem].status': 'pending'
      }
    }, {
      arrayFilters: [{ 'elem.assessmentId': assessment._id }]
    });

    return NextResponse.json({
      success: true,
      assessment: updatedAssessment,
    });
  } catch (error) {
    console.error("[ASSESSMENT_UPDATE_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { childId: string } }
) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { teacherId } = await req.json();

    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "teacher") {
      return NextResponse.json({ error: "Invalid teacher" }, { status: 400 });
    }

    const updatedChild = await User.findByIdAndUpdate(
      params.childId,
      {
        $set: {
          "studentProfile.assessmentStatus": "teacher_assigned",
          "studentProfile.subjects.$[].teacher": teacherId,
        },
      },
      { new: true }
    ).populate("studentProfile.subjects.teacher", "name");

    if (!updatedChild) {
      return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, child: updatedChild });
  } catch (error) {
    console.error("[TEACHER_ASSIGNMENT_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to assign teacher" },
      { status: 500 }
    );
  }
}
