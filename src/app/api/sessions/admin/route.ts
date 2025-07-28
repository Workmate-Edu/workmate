// src/app/api/sessions/admin/route.ts

import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { TeachingSession } from "@/models/teaching-session"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await connectDB()

  // Get all teaching sessions, populate teacher and student
  const sessions = await TeachingSession.find({})
    .sort({ startTime: -1 })
    .populate("teacherId", "name")
    .populate("studentId", "name")
    .lean()

  // Flatten for easier frontend use
  const result = sessions.map((s) => ({
    _id: s._id,
    teacher: s.teacherId,
    student: s.studentId || null,
    subject: s.subject?.name || "",
    startTime: s.startTime,
    endTime: s.endTime,
    timezone: s.timezone,
    status: s.status
  }))

  return NextResponse.json(result)
}
