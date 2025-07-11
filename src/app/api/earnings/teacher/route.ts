import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Earning } from "@/models/earning"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  await connectDB()
  // Get all earnings for this teacher, including session info
  const earnings = await Earning.find({ teacherId: session.user.id })
    .sort({ date: -1 })
    .populate("sessionId", "subject startTime endTime duration meetingLink status")
    .lean()
  return NextResponse.json(earnings)
}
