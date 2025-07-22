import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import authOptions from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/user"
import { TeachingSession } from "@/models/teaching-session"
import { Review } from "@/models/review"
import { Earning } from "@/models/earning"

export async function GET() {
  try {
    await connectDB()

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const teacherId = session.user.id

    // 1) Load teacher and verify role, populate assignedStudents
    const teacher = await User.findById(teacherId)
      .select("teacherProfile.assignedStudents teacherProfile.subjects teacherProfile.rating")
      .populate({
        path: "teacherProfile.assignedStudents",
        select: "name email"
      })
      .lean()

    if (!teacher || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const assignedStudents = Array.isArray(teacher.teacherProfile?.assignedStudents)
      ? teacher.teacherProfile.assignedStudents
      : []

    // 2) Load all teaching sessions for this teacher, populate student name
    const sessions = await TeachingSession.find({ teacherId })
      .populate({ path: "studentId", select: "name" })
      .lean()

    // 3) Count completed/upcoming sessions
    const completedSessions = sessions.filter(s => s.status === "completed")
    const upcomingSessions = sessions.filter(s => s.status === "scheduled" || s.status === "upcoming")

    // 4) Compute total teaching hours (only on completed)
    const teachingHours = completedSessions.reduce((sum, s) => {
      const durationMs = new Date(s.endTime).getTime() - new Date(s.startTime).getTime()
      return sum + durationMs / (1000 * 60 * 60)
    }, 0)

    // 5) Aggregate reviews for average + count
    const reviewsAgg = await Review.aggregate([
      { $match: { teacherId: teacher._id } },
      { $group: { _id: "$teacherId", avg: { $avg: "$rating" }, count: { $sum: 1 } } }
    ])
    const averageRating = reviewsAgg[0]?.avg ?? 0
    const reviewCount   = reviewsAgg[0]?.count ?? 0

    // 6) Build per‐subject stats: unique students, completed/upcoming counts, hours
    const sessionsBySubject = Object.values(
      sessions.reduce<Record<string, any>>((acc, sess) => {
        const key = `${sess.subject.name}‑${sess.subject.area}`
        if (!acc[key]) {
          acc[key] = {
            subject: sess.subject,
            students: new Set<string>(),
            completed: 0,
            upcoming: 0,
            hours: 0
          }
        }
        // unique student
        if (sess.studentId?._id) {
          acc[key].students.add(sess.studentId._id.toString())
        }
        // tally
        if (sess.status === "completed") {
          acc[key].completed++
          const d = (new Date(sess.endTime).getTime() - new Date(sess.startTime).getTime())
          acc[key].hours += d / (1000 * 60 * 60)
        } else if (sess.status === "scheduled" || sess.status === "upcoming") {
          acc[key].upcoming++
        }
        return acc
      }, {})
    ).map((entry: any) => ({
      name: entry.subject.name,
      area: entry.subject.area,
      studentCount: entry.students.size,
      completedSessions: entry.completed,
      upcomingSessions: entry.upcoming,
      hours: Math.round(entry.hours * 10) / 10
    }))

    // 7) Recent completed sessions
    const recentSessions = completedSessions
      .sort((a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime())
      .slice(0, 5)
      .map(s => ({
        id: s._id,
        subject: s.subject,
        studentName: s.studentId?.name ?? "—",
        date: s.endTime
      }))

    // 8) Calculate earnings (sum of all teacher earnings from Earning model)
    let earnings = 0
    try {
      const earningDocs = await Earning.find({ teacherId: teacher._id }).lean()
      earnings = earningDocs.reduce((sum, e) => sum + (e.amount || 0), 0)
    } catch (e) {
      earnings = 0
    }

    // Final payload
    const stats = {
      totalStudents: assignedStudents.length,
      activeClasses: teacher.teacherProfile?.subjects?.length ?? 0,
      completedSessions: completedSessions.length,
      upcomingSessions: upcomingSessions.length,
      teachingHours: Math.round(teachingHours * 10) / 10,
      averageRating,
      reviewCount,
      earnings,
      subjects: sessionsBySubject,
      recentSessions,
      assignedStudents
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("[TEACHER_STATS_ERROR]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
  
