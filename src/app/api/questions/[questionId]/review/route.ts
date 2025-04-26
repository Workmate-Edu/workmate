import { NextResponse } from "next/server";
import { QuestionBank } from "@/models/question-bank";
import { getServerSession } from "next-auth/next";
import authOptions from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";

export async function POST(
  req: Request,
  { params }: { params: { questionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: "Unauthorized" }, 
        { status: 401 }
      );
    }

    const { status, feedback } = await req.json();
    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    await connectDB();
    
    // Update question status and add feedback if provided
    const question = await QuestionBank.findByIdAndUpdate(
      params.questionId,
      {
        $set: {
          'verification.status': status,
          ...(feedback && { 'verification.feedback': feedback })
        }
      },
      { new: true }
    );

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(question);
  } catch (error) {
    console.error("[QUESTION_REVIEW_ERROR]", error);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
