import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await req.text();
    const [socketId, channel] = data
      .split("&")
      .map(item => item.split("=")[1]);

    const authResponse = pusherServer.authorizeChannel(
      socketId,
      channel,
      {
        user_id: session.user.id,
        user_info: {
          name: session.user.name,
          email: session.user.email
        }
      }
    );

    return NextResponse.json(authResponse);
  } catch (error) {
    console.error("Pusher auth error:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
