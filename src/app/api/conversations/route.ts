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
    const role = searchParams.get("role");

    const filter: any = {
      participants: { $elemMatch: { userId: session.user.id } }
    };
    if (role) {
      filter.participants = {
        $all: [
          { $elemMatch: { userId: session.user.id } },
          { $elemMatch: { role } }
        ]
      };
    }

    const convos = await Conversation.find(filter)
      .populate("participants.userId", "name email role")
      .sort({ updatedAt: -1 })
      .lean();

    const transformed = convos.map(conv => {
      const other = conv.participants.find(p => {
        const idStr = p.userId?._id?.toString() || p.userId?.toString();
        return idStr !== session.user.id;
      });
      return {
        _id: conv._id,
        participants: conv.participants,
        lastMessage: conv.lastMessage,
        unreadCount: conv.unreadCount || 0,
        otherParticipant: other && {
          name:  other.userId?.name  || other.name,
          email: other.userId?.email || other.email,
          role:  other.userId?.role  || other.role
        },
        type:      conv.type,
        childId:   conv.childId,
        childName: conv.childName
      };
    });

    return NextResponse.json(transformed);
  } catch (error) {
    console.error("[CONVERSATIONS_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const {
      participantId,
      participant,
      type = "direct_student",
      studentType = "independent",
      childId,
      childName
    } = await request.json();

    const existing = await Conversation.findOne({
      $and: [
        { "participants.userId": { $all: [session.user.id, participantId] } },
        { type }
      ]
    }).lean();

    if (existing) {
      return NextResponse.json(existing);
    }

    const convoData: any = {
      participants: [
        {
          userId: session.user.id,
          role:   session.user.role,
          name:   session.user.name,
          email:  session.user.email
        },
        {
          userId: participantId,
          role:   participant.role,
          name:   participant.name,
          email:  participant.email
        }
      ],
      type,
      studentType
    };

    if (childId)   convoData.childId   = childId;
    if (childName) convoData.childName = childName;

    const convo = await Conversation.create(convoData);
    return NextResponse.json(convo);
  } catch (error) {
    console.error("[CONVERSATION_POST_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to process conversation" },
      { status: 500 }
    );
  }
}
