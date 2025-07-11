import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { TeachingSession } from "@/models/teaching-session"
import { Earning } from "@/models/earning"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  await connectDB()
  const teachingSession = await TeachingSession.findById(params.id)
  if (!teachingSession) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 })
  }
  // Only allow if teacher has marked as complete
  if (teachingSession.status !== "teacher-completed") {
    return NextResponse.json({ error: "Teacher must mark as complete first" }, { status: 400 })
  }
  teachingSession.status = "completed"
  teachingSession.adminCompletedAt = new Date()
  await teachingSession.save()

  // Calculate earning: duration is in minutes, so hours = duration / 60
  const hours = teachingSession.duration ? teachingSession.duration / 60 : 1
  const amount = Math.round(hours * 5000)
  // Create earning record for this session and teacher
  await Earning.create({
    teacherId: teachingSession.teacherId,
    sessionId: teachingSession._id,
    hours,
    amount,
    date: teachingSession.endTime,
    status: "pending",
  })

  return NextResponse.json({ success: true })
}
