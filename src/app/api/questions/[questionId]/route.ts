import { NextResponse } from "next/server";
import { QuestionBank } from "@/models/question-bank";
import { getServerSession } from "next-auth/next";
import authOptions from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";

export async function GET(req: Request, { params }: { params: { questionId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const query = session.user.role === 'admin'
      ? { _id: params.questionId }
      : { _id: params.questionId, createdBy: session.user.id };

    const question = await QuestionBank.findOne(query);
    
    if (!question) {
      return NextResponse.json(
        { error: "Question not found or unauthorized" }, 
        { status: 404 }
      );
    }

    return NextResponse.json(question);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal error" }, 
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, { params }: { params: { questionId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== 'admin' && session.user.role !== 'teacher') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    await connectDB();

    // Teachers can only edit their own questions and can't change verification status
    if (session.user.role === 'teacher') {
      delete data.verification; // Prevent teachers from modifying verification status
    }

    const query = session.user.role === 'admin'
      ? { _id: params.questionId }
      : { _id: params.questionId, createdBy: session.user.id };

    const question = await QuestionBank.findOneAndUpdate(query, { $set: data }, { new: true });

    if (!question) {
      return NextResponse.json(
        { error: "Question not found or unauthorized" }, 
        { status: 404 }
      );
    }

    return NextResponse.json(question);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal error" }, 
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: { questionId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    
    const query = session.user.role === 'admin'
      ? { _id: params.questionId }
      : { _id: params.questionId, createdBy: session.user.id };

    const question = await QuestionBank.findOneAndDelete(query);

    if (!question) {
      return NextResponse.json(
        { error: "Question not found or unauthorized" }, 
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal error" }, 
      { status: 500 }
    );
  }
}
