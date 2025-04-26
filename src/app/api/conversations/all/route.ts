import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Conversation } from "@/models/message";

export async function GET() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find all conversations where user is participant
    const conversations = await Conversation.find({
      'participants': {
        $elemMatch: { 
          $or: [
            { userId: session.user.id },
            { 'userId._id': session.user.id }
          ]
        }
      }
    })
    .populate({
      path: 'participants.userId',
      select: 'name email role'
    })
    .populate('lastMessage')
    .sort({ updatedAt: -1 })
    .lean();

    console.log('Found conversations:', conversations); // Debug log

    // Transform conversations to include proper participant info
    const transformedConversations = conversations.map(conv => {
      const otherParticipant = conv.participants.find(p => {
        const participantId = p.userId?._id?.toString() || p.userId?.toString();
        return participantId !== session.user.id;
      });

      return {
        _id: conv._id,
        participants: conv.participants,
        lastMessage: conv.lastMessage,
        unreadCount: conv.unreadCount || 0,
        otherParticipant: otherParticipant ? {
          name: otherParticipant.name || otherParticipant.userId?.name,
          role: otherParticipant.role,
          email: otherParticipant.email || otherParticipant.userId?.email
        } : null
      };
    });

    console.log('Transformed conversations:', transformedConversations); // Debug log
    return NextResponse.json(transformedConversations);

  } catch (error) {
    console.error("[CONVERSATIONS_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}
