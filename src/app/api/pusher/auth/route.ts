import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";
import { connectDB } from '@/lib/mongodb';
import { isConversationParticipant } from '@/lib/conversation-access';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = new URLSearchParams(await req.text());
    const socketId = data.get('socket_id');
    const channel = data.get('channel_name');
    if (!socketId || !/^\d+\.\d+$/.test(socketId) || !channel) {
      return new NextResponse('Invalid channel request', { status: 400 });
    }
    let allowed = channel === `private-user-${session.user.id}`;
    if (channel.startsWith('private-chat-')) {
      await connectDB();
      allowed = await isConversationParticipant(channel.slice('private-chat-'.length), session.user.id);
    }
    if (!allowed) return new NextResponse('Forbidden', { status: 403 });

    const authResponse = pusherServer.authorizeChannel(
      socketId,
      channel
    );

    return NextResponse.json(authResponse);
  } catch (error) {
    console.error("Pusher auth error:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
