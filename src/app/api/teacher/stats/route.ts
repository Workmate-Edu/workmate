import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth" 
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/user"
import { TeachingSession } from "@/models/teaching-session"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'teacher') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Get teacher data with populated students and sessions
    const teacher = await User.findById(session.user.id)
      .select('teacherProfile name email')
      .populate({
        path: 'teacherProfile.assignedStudents',
        select: 'name studentProfile.subjects grade'
      })
      .lean()

    // Fallback: If assignedStudents is just an array of IDs, fetch their details
    let assignedStudents = []
    if (
      Array.isArray(teacher.teacherProfile?.assignedStudents) &&
      teacher.teacherProfile.assignedStudents.length > 0 &&
      typeof teacher.teacherProfile.assignedStudents[0] === "string"
    ) {
      assignedStudents = await User.find({
        _id: { $in: teacher.teacherProfile.assignedStudents }
      })
        .select('name studentProfile.subjects grade')
        .lean()
    } else if (Array.isArray(teacher.teacherProfile?.assignedStudents)) {
      assignedStudents = teacher.teacherProfile.assignedStudents
    }

    // Get all teaching sessions for this teacher
    const sessions = await TeachingSession.find({
      teacherId: session.user.id
    })
    .select('startTime endTime status subject studentId')
    .populate('studentId', 'name')
    .lean()

    // Calculate teaching metrics
    const completedSessions = sessions.filter(s => s.status === 'completed')
    const teachingHours = completedSessions.reduce((total, session) => {
      const duration = new Date(session.endTime).getTime() - new Date(session.startTime).getTime()
      return total + (duration / (1000 * 60 * 60)) 
    }, 0)

    // Group sessions by subject
    const sessionsBySubject = sessions.reduce((acc, session) => {
      const key = `${session.subject.name}-${session.subject.area}`
      if (!acc[key]) {
        acc[key] = {
          subject: session.subject,
          completed: 0,
          upcoming: 0,
          hours: 0,
          students: new Set()
        }
      }
      acc[key].students.add(session.studentId._id.toString())
      if (session.status === 'completed') {
        acc[key].completed++
        const duration = new Date(session.endTime).getTime() - new Date(session.startTime).getTime()
        acc[key].hours += duration / (1000 * 60 * 60)
      } else if (session.status === 'scheduled') {
        acc[key].upcoming++
      }
      return acc
    }, {})

    const stats = {
      totalStudents: assignedStudents.length,
      activeClasses: teacher.teacherProfile?.subjects?.length || 0,
      completedSessions: completedSessions.length,
      teachingHours: Math.round(teachingHours * 10) / 10,
      averageRating: teacher.teacherProfile?.rating || 0,
      upcomingSessions: sessions.filter(s => s.status === 'scheduled').length,
      subjects: Object.values(sessionsBySubject).map(subj => ({
        ...subj.subject,
        studentCount: subj.students.size,
        completedSessions: subj.completed,
        upcomingSessions: subj.upcoming,
        hours: Math.round(subj.hours * 10) / 10
      })),
      recentSessions: sessions
        .filter(s => s.status === 'completed')
        .sort((a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime())
        .slice(0, 5)
        .map(s => ({
          id: s._id,
          subject: s.subject,
          studentName: s.studentId.name,
          date: s.endTime
        })),
      assignedStudents // always an array of student objects
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('[TEACHER_STATS_ERROR]', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
