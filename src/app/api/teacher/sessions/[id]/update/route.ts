import { publishIntroductionSchema } from '@/lib/introduction-booking';
import { scheduleTransaction, assertScheduleAvailable, sessionOccurrences, recurrenceEnd, SchedulingError } from '@/lib/scheduling';
// /app/api/teacher/sessions/[id]/update.ts

import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { TeachingSession } from "@/models/teaching-session"
import { Types } from "mongoose"

// PUT /api/teacher/sessions/[id]/update
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  // 1) Auth + ID validation
  const auth = await getServerSession(authOptions)
  if (!auth?.user || auth.user.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id } = params
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid session id" }, { status: 400 })
  }

  // 2) Connect & fetch
  await connectDB()
  const sessionDoc = await TeachingSession.findById(id)
  if (!sessionDoc) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 })
  }

  // 3) Ownership check
  if (sessionDoc.teacherId.toString() !== auth.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // 4) Parse body & build updates
  const body = await req.json()
  const updates: any = {}

  // Simple fields
  if (body.startTime)      updates.startTime   = new Date(body.startTime)
  if (body.duration != null) updates.duration    = Number(body.duration)
  if (body.externalLink) {
    if (!publishIntroductionSchema.shape.meetingLink.safeParse(body.externalLink).success) return NextResponse.json({ error: "Provide a valid HTTPS meeting link" }, { status: 400 });
    updates.meetingLink = body.externalLink;
  }

  // If the front‑end sent recurrence, map endsOn → endDate
  if (body.recurrence) {
    const r = body.recurrence
    const rec: any = {
      isRecurring: !!r.isRecurring,
      pattern:     r.pattern,
      daysOfWeek:  Array.isArray(r.daysOfWeek) ? r.daysOfWeek : [],
      // preserve existing startDate or default to session.startTime
      startDate:   sessionDoc.recurrence?.startDate ?? sessionDoc.startTime
    }

    // Map endsOn string → Date
    if (r.endsOn) {
      const d = recurrenceEnd(r.endsOn, sessionDoc.timezone || 'UTC')
      if (isNaN(d.getTime())) {
        return NextResponse.json(
          { error: "Invalid recurrence end date" },
          { status: 400 }
        )
      }
      rec.endDate = d
    }

    // Optionally recompute totalSessions here if desired:
    // rec.totalSessions = calculateTotalSessions(rec.startDate, rec)

    updates.recurrence = rec
  }

  // 5) Recompute endTime if startTime or duration changed
  if (updates.startTime || updates.duration) {
    const start = updates.startTime ?? sessionDoc.startTime
    const dur   = updates.duration  ?? sessionDoc.duration
    updates.endTime = new Date(start.getTime() + dur * 60_000)
  }

  try {
    const updated = await scheduleTransaction(auth.user.id, async transaction => {
      const current = await TeachingSession.findOne({ _id: id, teacherId: auth.user.id }).session(transaction);
      if (!current) throw new SchedulingError('Session not found');
      Object.assign(current, updates);
      if (updates.startTime || updates.duration || updates.recurrence) {
        current.endTime = new Date(new Date(current.startTime).getTime() + Number(current.duration) * 60000);
        await assertScheduleAvailable(auth.user.id, sessionOccurrences(current), transaction, { teachingId: id });
      }
      return current.save({ session: transaction });
    });
    return NextResponse.json({ success: true, session: updated });
  } catch (error) {
    return NextResponse.json({ error: error instanceof SchedulingError ? error.message : 'Unable to update session' }, { status: error instanceof SchedulingError ? 409 : 500 });
  }
}
