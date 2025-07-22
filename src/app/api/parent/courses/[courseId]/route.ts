// app/api/student/courses/[courseId]/route.ts

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
    // 1. Ensure the user is signed in as a student
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 2. Connect to MongoDB
    await connectDB()

    // 3. Fetch just the subjects + assigned teacher refs
    const student = await User.findById(session.user.id)
      .select("studentProfile.subjects studentProfile.assignedTeachers teachers")
      .populate([
        { path: "teachers", select: "name email" },
        {
          path: "studentProfile.assignedTeachers.teacherId",
          select: "name email",
        },
      ])
      .lean()

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // 4. Locate the one subject matching the courseId param
    const subject = student.studentProfile.subjects.find(
      (s) => s._id.toString() === params.courseId
    )
    if (!subject) {
      return NextResponse.json(
        { error: "Subject not enrolled" },
        { status: 404 }
      )
    }

    // 5. Pick a teacher: first from top‐level array, then from assignedTeachers
    const teacherDoc =
      student.teachers?.[0] ||
      student.studentProfile.assignedTeachers?.[0]?.teacherId

    if (!teacherDoc) {
      return NextResponse.json(
        { error: "No teacher assigned" },
        { status: 404 }
      )
    }

    // 6. Build the response payload
    return NextResponse.json({
      courseId: params.courseId,
      teacherId: teacherDoc._id.toString(),
      title: `${subject.area} - ${subject.name}`,
      description: `${subject.level ?? "Beginner"} level course`,
      startDate: subject.startDate
        ? new Date(subject.startDate).toISOString()
        : new Date().toISOString(),
      status: subject.status ?? "active",

      // ← Your actual progress value here
      progress: subject.progress ?? 0,

      subject: {
        area: subject.area,
        name: subject.name,
        level: subject.level ?? "beginner",
        nextCall: subject.nextCall,
      },

      structure: {
        duration: {
          weeks: subject.duration?.weeks ?? 12,
          totalHours: subject.duration?.totalHours ?? 36,
          sessionsPerWeek: subject.duration?.sessionsPerWeek ?? 3,
        },
        format: subject.format ?? "online",
        sessionTypes: subject.sessionTypes ?? [
          { type: "lecture", duration: 60, frequency: "weekly" },
        ],
      },

      curriculum:
        subject.curriculum ??
        [
          {
            week: 1,
            theme: "Introduction",
            sessions: [
              {
                type: "lecture",
                topic: "Course Overview",
                objectives: [
                  "Understand course structure",
                  "Set learning goals",
                ],
                activities: [
                  "Course introduction",
                  "Learning style assessment",
                ],
              },
            ],
          },
          {
            week: 2,
            theme: "Fundamentals",
            sessions: [
              {
                type: "practice",
                topic: "Basic Concepts",
                objectives: [
                  "Master core concepts",
                  "Practice basic skills",
                ],
                activities: ["Theory review", "Practical exercises"],
              },
            ],
          },
        ],

      teacher: {
        id: teacherDoc._id.toString(),
        name: teacherDoc.name,
        email: teacherDoc.email,
      },
    })
  } catch (error) {
    console.error("[STUDENT_COURSE_DETAIL_ERROR]", error)
    return NextResponse.json(
      { error: "Failed to fetch course details" },
      { status: 500 }
    )
  }
}
