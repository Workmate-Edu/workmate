import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";
import { connectDB } from '@/lib/mongodb';
import { isConversationParticipant } from '@/lib/conversation-access';

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(
  req: Request,
  { params }: { params: { conversationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { isTyping } = await req.json();

    await connectDB();
    if (!await isConversationParticipant(params.conversationId, session.user.id)) {
      return new NextResponse("Conversation not found", { status: 404 });
    }

    await pusherServer.trigger(
      `private-chat-${params.conversationId}`,
      'typing-status',
      {
        userId: session.user.id,
        name: session.user.name,
        isTyping
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 });
  }
}
