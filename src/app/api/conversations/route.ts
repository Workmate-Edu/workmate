import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Conversation } from "@/models/message";
import mongoose from "mongoose";
import { encrypt, decrypt } from "@/lib/encryption";

export async function GET(request: Request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Base query to find conversations for the current user
    const query = {
      'participants': {
        $elemMatch: { 
          userId: session.user.id 
        }
      }
    };

    // If role is specified, add it to the query
    if (role) {
      query['participants'] = {
        $all: [
          { $elemMatch: { userId: session.user.id }},
          { $elemMatch: { role: role }}
        ]
      };
    }

    const conversations = await Conversation.find(query)
      .populate('participants.userId', 'name email role')
      .sort({ updatedAt: -1 })
      .lean();

    // Transform conversations to include otherParticipant
    const transformedConversations = conversations.map(conv => {
      // Find the other participant (not the current user)
      const otherParticipant = conv.participants?.find(p => {
        // Safely check for userId
        const participantId = p.userId?._id?.toString() || p.userId?.toString();
        return participantId !== session.user.id;
      });

      // Safely create otherParticipant object
      const other = otherParticipant ? {
        name: otherParticipant.userId?.name || otherParticipant.name,
        email: otherParticipant.userId?.email || otherParticipant.email,
        role: otherParticipant.userId?.role || otherParticipant.role
      } : null;

      return {
        _id: conv._id,
        participants: conv.participants,
        lastMessage: conv.lastMessage,
        unreadCount: conv.unreadCount || 0,
        otherParticipant: other,
        type: conv.type,
        childId: conv.childId,
        childName: conv.childName
      };
    });

    return NextResponse.json(transformedConversations);

  } catch (error) {
    console.error("[CONVERSATIONS_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { participantId, type, childId, studentType } = await req.json();

    await connectDB();

    // Find existing conversation
    const query: any = {
      participants: {
        $all: [
          { $elemMatch: { userId: session.user.id } },
          { $elemMatch: { userId: participantId } }
        ]
      },
      type
    };

    // For parent conversations, include childId in query
    if (type === 'parent' && childId) {
      query.childId = childId;
    }

    const existingConversation = await Conversation.findOne(query)
      .populate('participants.userId', 'name email role');

    if (existingConversation) {
      return NextResponse.json(existingConversation);
    }

    // Create new conversation
    const conversationData = {
      type,
      studentType,
      participants: [
        {
          userId: session.user.id,
          role: session.user.role
        },
        {
          userId: participantId,
          role: type === 'parent' ? 'parent' : 'student'
        }
      ],
      ...(childId && { childId }) // Include childId if provided
    };

    const conversation = await Conversation.create(conversationData);
    const populatedConversation = await conversation.populate('participants.userId', 'name email role');

    return NextResponse.json(populatedConversation);
  } catch (error) {
    console.error("Error creating conversation:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
