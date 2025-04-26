import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Notification } from "@/models/notification"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')
    const skip = (page - 1) * limit

    console.log('Fetching notifications for user:', session.user.id)

    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ 
        userId: session.user.id,
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

      Notification.countDocuments({
        userId: session.user.id,
        'status.read': false
      })
    ])

    console.log(`Found ${notifications.length} notifications, ${unreadCount} unread`)

    return NextResponse.json({ notifications, unreadCount })
  } catch (error) {
    console.error('[NOTIFICATIONS_GET]', error)
    return NextResponse.json(
      { error: "Internal error", notifications: [], unreadCount: 0 },
      { status: 500 }
    )
  }
}
