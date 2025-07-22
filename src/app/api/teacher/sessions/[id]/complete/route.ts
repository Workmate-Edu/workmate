import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { TeachingSession } from "@/models/teaching-session"
import { isAfter } from "date-fns"
import mongoose from "mongoose"

export async function POST(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sessionId = context.params.id
    // Validate sessionId before querying
    if (!sessionId || typeof sessionId !== "string" || !mongoose.Types.ObjectId.isValid(sessionId)) {
      return NextResponse.json({ error: "Invalid session id" }, { status: 400 })
    }

    await connectDB()

    const teachingSession = await TeachingSession.findById(sessionId)

    if (!teachingSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    if (teachingSession.teacherId.toString() !== session.user.id) {
      return NextResponse.json({ error: "This session does not belong to you" }, { status: 403 })
    }

    if (["teacher-completed", "completed"].includes(teachingSession.status)) {
      return NextResponse.json({ error: "Session already completed" }, { status: 400 })
    }

    // Prevent marking future sessions
    if (isAfter(new Date(teachingSession.endTime), new Date())) {
      return NextResponse.json({ error: "Cannot mark future sessions as complete" }, { status: 400 })
    }

    teachingSession.status = "teacher-completed"
    await teachingSession.save()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[MARK_SESSION_COMPLETE_ERROR]", error)
    return NextResponse.json({ error: "Failed to mark session as complete" }, { status: 500 })
  }
}
