import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Conversation, NewMessage } from "@/models/message";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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

    await connectDB();
    if (!await isConversationParticipant(params.conversationId, session.user.id)) {
      return new NextResponse("Conversation not found", { status: 404 });
    }

    // Mark all messages as read for this user
    await NewMessage.updateMany(
      {
        conversationId: params.conversationId,
        senderId: { $ne: session.user.id },
        'readBy.userId': { $ne: session.user.id }
      },
      {
        $push: {
          readBy: {
            userId: session.user.id,
            readAt: new Date()
          }
        }
      }
    );

    // Reset unread count for this user
    await Conversation.findByIdAndUpdate(
      params.conversationId,
      { unreadCount: 0 }
    );

    return new NextResponse("Messages marked as read");
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
