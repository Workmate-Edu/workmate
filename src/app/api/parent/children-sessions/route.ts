import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/user"
import { TeachingSession } from "@/models/teaching-session"
import type { Types } from "mongoose"

// Only the bit of `User` we actually need here
interface ParentWithChildren {
  parentProfile?: {
    children?: (Types.ObjectId | string)[]
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "parent") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Tell TS exactly what shape .lean() will give us
    const parent = await User.findById(session.user.id)
      .select("parentProfile.children")
      .lean<ParentWithChildren>()

    if (!parent) {
      console.warn(`[PARENT_SCHEDULE_WARN] parent id ${session.user.id} not found`)
      return NextResponse.json([], { status: 200 })
    }

    const childrenIds = Array.isArray(parent.parentProfile?.children)
      ? parent.parentProfile.children.map(id => id.toString())
      : []

    if (childrenIds.length === 0) {
      return NextResponse.json([], { status: 200 })
    }

    const rawSessions = await TeachingSession.find({
      studentId: { $in: childrenIds }
    })
      .populate("teacherId", "name email")
      .populate("studentId", "name")
      .populate("subject")
      .sort({ startTime: -1 })
      .lean()

    // keep only ones with both student & teacher populated
    const valid = rawSessions.filter(s => s.studentId && s.teacherId)

    const formatted = valid.map(s => ({
      id:         s._id.toString(),
      student: {
        id:   (s.studentId as any)._id.toString(),
        name: (s.studentId as any).name
      },
      teacher: {
        // ← include the teacher’s _id so we can POST it later
        id:    (s.teacherId as any)._id.toString(),
        name:  (s.teacherId as any).name,
        email: (s.teacherId as any).email
      },
      subject:     s.subject,
      startTime:   s.startTime,
      endTime:     s.endTime,
      duration:    s.duration,
      meetingLink: s.meetingLink,
      status:      s.status,
    }))

    return NextResponse.json(formatted)

  } catch (err: any) {
    console.error("[PARENT_SESSION_ERROR]", err)
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    )
  }
}
