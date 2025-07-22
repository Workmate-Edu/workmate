import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/user"
import { InitialAssessment } from "@/models/initial-assessment"
import { ChildAssessment } from "@/models/child-assessment"
import { TeachingSession } from "@/models/teaching-session"
import { Assessment as TeacherAssessment } from "@/models/assessment"
import authOptions from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'student') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Get student profile and assigned teachers
    const student = await User.findById(session.user.id)
      .select('studentProfile')
      .populate([
        {
          path: 'studentProfile.assignedTeachers.teacherId',
          select: 'name email subjects teacherProfile.rating'
        },
        {
          path: 'teachers',
          select: 'name email subjects teacherProfile.rating'
        }
      ])
      .lean()

    // Get all teaching sessions for this student
    const teachingSessions = await TeachingSession.find({
      studentId: session.user.id
    })
    .select('startTime endTime status subject')
    .lean()

    // --- Use TeacherAssessment for ongoing assessments ---
    const teacherAssessments = await TeacherAssessment.find({
      studentId: session.user.id
    })
    .select('status subject submittedAt grade points feedback')
    .lean()

    // Get initial/child assessment for reference (one-time, not for ongoing stats)
    const [initialAssessments, childAssessments] = await Promise.all([
      InitialAssessment.find({ studentId: session.user.id })
        .select('status subject submittedAt')
        .lean(),
      ChildAssessment.find({ childId: session.user.id })
        .select('status submittedAt')
        .lean()
    ])

    // Calculate teaching hours
    const completedSessions = teachingSessions.filter(s => s.status === 'completed')
    const learningHours = completedSessions.reduce((total, session) => {
      const duration = new Date(session.endTime).getTime() - new Date(session.startTime).getTime()
      return total + (duration / (1000 * 60 * 60))
    }, 0)

    // Calculate subject progress with assigned teachers
    const subjects = student.studentProfile?.subjects?.map(subject => {
      const assignedTeacher = student.studentProfile.assignedTeachers?.find(at => 
        at.subjects.some(s => s.name === subject.name && s.area === subject.area)
      )

      return {
        name: subject.name,
        area: subject.area,
        progress: subject.progress || 0,
        teacher: assignedTeacher ? {
          id: assignedTeacher.teacherId._id,
          name: assignedTeacher.teacherId.name,
          email: assignedTeacher.teacherId.email,
          rating: assignedTeacher.teacherId.teacherProfile?.rating
        } : null
      }
    }) || []

    // Group sessions by subject
    const sessionsBySubject = teachingSessions.reduce((acc, session) => {
      const key = `${session.subject.name}-${session.subject.area}`
      if (!acc[key]) acc[key] = []
      acc[key].push(session)
      return acc
    }, {} as Record<string, typeof teachingSessions>)

    // --- Assessment stats from TeacherAssessment ---
    const completedTeacherAssessments = teacherAssessments.filter(a => a.status === 'graded' || a.status === 'completed')
    const averageScore = completedTeacherAssessments.length > 0
      ? completedTeacherAssessments.reduce((sum, a) => sum + (a.grade ?? 0), 0) / completedTeacherAssessments.length
      : 0

    const stats = {
      teachers: {
        total: student.studentProfile?.assignedTeachers?.length || 0,
        list: student.studentProfile?.assignedTeachers?.map(at => ({
          id: at.teacherId._id,
          name: at.teacherId.name,
          email: at.teacherId.email,
          rating: at.teacherId.teacherProfile?.rating,
          subjects: at.subjects
        })) || []
      },
      assessments: {
        total: teacherAssessments.length,
        completed: completedTeacherAssessments.length,
        averageScore: Math.round(averageScore * 10) / 10,
        recent: teacherAssessments
          .sort((a, b) => new Date(b.submittedAt ?? 0).getTime() - new Date(a.submittedAt ?? 0).getTime())
          .slice(0, 5)
      },
      sessions: {
        completed: completedSessions.length,
        upcoming: teachingSessions.filter(s => s.status === 'scheduled').length,
        totalHours: Math.round(learningHours * 10) / 10,
        bySubject: Object.entries(sessionsBySubject).map(([key, sessions]) => ({
          subject: sessions[0].subject,
          completed: sessions.filter(s => s.status === 'completed').length,
          upcoming: sessions.filter(s => s.status === 'scheduled').length,
          hours: Math.round(sessions.reduce((total, s) => {
            if (s.status === 'completed') {
              const duration = new Date(s.endTime).getTime() - new Date(s.startTime).getTime()
              return total + (duration / (1000 * 60 * 60))
            }
            return total
          }, 0) * 10) / 10
        }))
      },
      subjects
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('[STUDENT_STATS_ERROR]', error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    )
  }
}
