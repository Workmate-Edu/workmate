// src/app/api/parent/children/[childId]/sessions/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { TeachingSession } from "@/models/teaching-session"

export async function GET(
  req: Request,
  { params }: { params: { childId: string } }
) {
  try {
    const userSession = await getServerSession(authOptions)
    if (!userSession?.user || userSession.user.role !== "parent") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Optional date‐range filtering
    const url = new URL(req.url)
    const from = url.searchParams.get("from")  // e.g. "2025-07-21"
    const to   = url.searchParams.get("to")    // e.g. "2025-08-21"

    const query: any = { studentId: params.childId }
    if (from && to) {
      query.startTime = {
        $gte: new Date(`${from}T00:00:00.000Z`),
        $lte: new Date(`${to}T23:59:59.999Z`),
      }
    }

    const sessions = await TeachingSession.find(query)
      .populate("teacherId", "name email")
      .populate("subject")
      .sort({ startTime: 1 })
      .lean()

    return NextResponse.json(
      sessions.map((s) => ({
        id: s._id,
        teacher: {
          name: s.teacherId.name,
          email: s.teacherId.email,
        },
        subject: s.subject,
        startTime: s.startTime,
        endTime: s.endTime,
        duration: s.duration,
        meetingLink: s.meetingLink,
        status: s.status,
        // <-- include the entire recurrence block
        recurrence: s.recurrence,
      }))
    )
  } catch (error) {
    console.error("[GET_CHILD_SESSIONS_ERROR]", error)
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    )
  }
}
