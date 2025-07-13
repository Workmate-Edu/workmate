// app/api/assigned-teachers/route.ts

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/user"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    let teachers: any[] = []

    if (session.user.role === "student") {
      // Student always gets theirs
      const student = await User.findById(session.user.id)
        .select("studentProfile.assignedTeachers")
        .populate({
          path: "studentProfile.assignedTeachers.teacherId",
          select: "name email teacherProfile.rating"
        })
        .lean()

      teachers = (student?.studentProfile?.assignedTeachers || []).map(a => ({
        id: a.teacherId._id,
        name: a.teacherId.name,
        email: a.teacherId.email,
        rating: a.teacherId.teacherProfile?.rating ?? 0,
        subject: a.subject,
        assignedAt: a.assignedAt
      }))

    } else if (session.user.role === "parent") {
      // Only proceed if parent opted in to learning
      const parent = await User.findById(session.user.id)
        .select("parentProfile.interestedInLearning parentProfile.assignedTeachers")
        .lean()

      if (!parent?.parentProfile?.interestedInLearning) {
        // Either return empty or a 403 – here we return empty list:
        return NextResponse.json([])
      }

      // Now populate the teachers & children
      const popParent = await User.findById(session.user.id)
        .select("parentProfile.assignedTeachers")
        .populate([
          {
            path: "parentProfile.assignedTeachers.teacherId",
            select: "name email teacherProfile.rating"
          },
          {
            path: "parentProfile.assignedTeachers.childId",
            select: "name"
          }
        ])
        .lean()

      teachers = (popParent?.parentProfile?.assignedTeachers || []).map(a => ({
        id: a.teacherId._id,
        name: a.teacherId.name,
        email: a.teacherId.email,
        rating: a.teacherId.teacherProfile?.rating ?? 0,
        childName: a.childId?.name ?? "—",
        assignedAt: a.assignedAt
      }))
    }

    return NextResponse.json(teachers)

  } catch (error) {
    console.error("[ASSIGNED_TEACHERS_ERROR]", error)
    return NextResponse.json(
      { error: "Failed to fetch assigned teachers" },
      { status: 500 }
    )
  }
}
