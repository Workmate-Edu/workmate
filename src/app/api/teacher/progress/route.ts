import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/user"

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { studentId, subjectId, progress } = await req.json()

    console.log("Update progress inputs:", { studentId, subjectId, progress })

    // subjectId here refers to the subject name
    const subjectName = subjectId.toLowerCase()

    await connectDB()

    const student = await User.findById(studentId).select("studentProfile.subjects")

    if (!student?.studentProfile?.subjects) {
      return NextResponse.json({ error: "Student not found or no subjects" }, { status: 404 })
    }

    // Find the index of the subject by name (case-insensitive)
    const subjectIndex = student.studentProfile.subjects.findIndex(
      (s: any) => s.name.toLowerCase() === subjectName
    )

    if (subjectIndex === -1) {
      console.log("Available subjects:", student.studentProfile.subjects)
      return NextResponse.json({ error: "Subject not found" }, { status: 404 })
    }

    // Update progress
    student.studentProfile.subjects[subjectIndex].progress = progress
    await student.save()

    return NextResponse.json({
      success: true,
      progress,
      subject: student.studentProfile.subjects[subjectIndex],
    })
  } catch (error) {
    console.error("[PROGRESS_UPDATE_ERROR]", error)
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    )
  }
}
