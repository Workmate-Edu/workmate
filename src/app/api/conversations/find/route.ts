import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Conversation } from "@/models/message";

export async function GET(request: Request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const participantId = searchParams.get("participantId");
    const role = searchParams.get("role") || 'student'; // Default to student if not specified

    if (!participantId) {
      return NextResponse.json(
        { error: "Participant ID is required" },
        { status: 400 }
      );
    }

    // Find existing conversation
    const conversation = await Conversation.findOne({
      'participants': {
        $all: [
          { $elemMatch: { userId: session.user.id }},
          { $elemMatch: { userId: participantId, role: role }}
        ]
      }
    }).populate('participants.userId', 'name email role');

    return NextResponse.json(conversation);

  } catch (error) {
    console.error("[FIND_CONVERSATION_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to find conversation" },
      { status: 500 }
    );
  }
}
