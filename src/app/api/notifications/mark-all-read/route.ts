import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { Notification } from "@/models/notification"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    await Notification.updateMany(
      { 
        userId: session.user.id,
        'status.read': false
      },
      {
        $set: {
          'status.read': true,
          'status.readAt': new Date()
        }
      }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[MARK_ALL_READ]', error)
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    )
  }
}
