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
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const body = await req.json()
    const studentType = body.studentType || 'independent'
    
    const conversationData = {
      participants: [
        {
          userId: session.user.id,
          role: session.user.role,
          name: session.user.name,
          email: session.user.email
        },
        body.participant
      ],
      type: studentType === 'child' ? 'parent_teacher' : 'direct_student', // Fixed type
      studentType: studentType,
    }

    console.log('Creating conversation with mapped type:', conversationData)

    const conversation = await Conversation.create(conversationData)
    return NextResponse.json(conversation)

  } catch (error) {
    console.error('Conversation creation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create conversation" },
      { status: 500 }
    )
  }
}
