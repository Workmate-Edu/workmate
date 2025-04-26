import { NextResponse } from "next/server";
import { QuestionBank } from "@/models/question-bank";
import { getServerSession } from "next-auth/next";
import authOptions from "@/lib/auth";  // Updated import
import { connectDB } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    console.log('Received data:', data);

    await connectDB();

    // Add verification and created by fields
    const questionData = {
      ...data,
      createdBy: session.user.id,
      verification: {
        status: 'pending'
      }
    };

    console.log('Creating question:', questionData);
    const question = await QuestionBank.create(questionData);
    console.log('Question created:', question);

    return NextResponse.json(question);
  } catch (error) {
    console.error("[QUESTIONS_POST]", error);
    return NextResponse.json(
      { error: "Failed to create question" }, 
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    
    // If not admin, can only see own questions
    const query = session.user.role === 'admin' 
      ? {}  // Admin can see all
      : { createdBy: session.user.id };  // Teachers see only their own
    
    await connectDB();
    const questions = await QuestionBank.find(query)
      .lean() // Convert to plain JavaScript objects
      .exec();

    // Transform _id to id and ensure dates are serialized
    const serializedQuestions = questions.map(q => ({
      ...q,
      id: q._id.toString(),
      createdAt: q.createdAt?.toISOString(),
      updatedAt: q.updatedAt?.toISOString(),
      _id: undefined
    }));

    return NextResponse.json(serializedQuestions);
  } catch (error) {
    console.error("[QUESTIONS_GET]", error);
    return NextResponse.json(
      { error: "Internal error" }, 
      { status: 500 }
    );
  }
}
