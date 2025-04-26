import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/user"

export async function GET(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'student') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const student = await User.findById(session.user.id)
      .select('studentProfile.subjects studentProfile.assignedTeachers teachers')
      .populate([
        {
          path: 'teachers',
          select: 'name email'
        },
        {
          path: 'studentProfile.assignedTeachers.teacherId',
          select: 'name email'
        }
      ])
      .lean()

    console.log('Student data:', JSON.stringify(student, null, 2)) // Debug

    // Find the subject in student's profile
    const subject = student?.studentProfile?.subjects?.find(s => 
      s._id.toString() === params.courseId
    )

    if (!subject) {
      return NextResponse.json({ error: "Subject not enrolled" }, { status: 404 })
    }

    // Try to find teacher from either array
    let teacher = student.teachers?.[0] || 
      student?.studentProfile?.assignedTeachers?.[0]?.teacherId

    if (!teacher) {
      return NextResponse.json({ error: "No teacher assigned" }, { status: 404 })
    }

    // Structure response to match frontend expectations
    return NextResponse.json({
      courseId: params.courseId,
      teacherId: teacher._id,
      title: `${subject.area} - ${subject.name}`,
      description: `${subject.level || 'Beginner'} level course`,
      startDate: subject.startDate || new Date().toISOString(),
      status: subject.status || 'active',
      subject: {
        area: subject.area,
        name: subject.name,
        level: subject.level || 'beginner',
        nextCall: subject.nextCall
      },
      structure: {
        duration: {
          weeks: subject.duration?.weeks || 12,
          totalHours: subject.duration?.totalHours || 36,
          sessionsPerWeek: subject.duration?.sessionsPerWeek || 3
        },
        format: subject.format || 'online',
        sessionTypes: subject.sessionTypes || [
          {
            type: 'lecture',
            duration: 60,
            frequency: 'weekly'
          }
        ]
      },
      curriculum: subject.curriculum || [
        {
          week: 1,
          theme: "Introduction",
          sessions: [
            {
              type: "lecture",
              topic: "Course Overview",
              objectives: ["Understand course structure", "Set learning goals"],
              activities: ["Course introduction", "Learning style assessment"]
            }
          ]
        },
        {
          week: 2,
          theme: "Fundamentals",
          sessions: [
            {
              type: "practice",
              topic: "Basic Concepts",
              objectives: ["Master core concepts", "Practice basic skills"],
              activities: ["Theory review", "Practical exercises"]
            }
          ]
        }
      ],
      progress: subject.progress || 0,
      teacher: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email
      }
    })

  } catch (error) {
    console.error('[STUDENT_COURSE_DETAIL_ERROR]', error)
    return NextResponse.json(
      { error: "Failed to fetch course details" },
      { status: 500 }
    )
  }
}