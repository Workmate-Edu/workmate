// app/api/parent/courses/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/user"
import type { Document } from "mongoose"

// mirror your StudentDocument—but for parentProfile
interface ParentDocument extends Document {
  parentProfile: {
    interestedInLearning: boolean
    subjects: Array<{ name: string; area: string }>
    assignedTeachers: Array<{
      teacherId: {
        _id: string
        name: string
        email: string
        teacherProfile: { rating?: number }
      }
      subjects: Array<{ name: string; area: string }>
      assignedAt: Date
    }>
  }
}

interface CourseArea {
  area: string
  subjects: Array<{
    id: string
    name: string
    teacher: { id: string; name: string; email: string }
    progress: number // parents always start at zero
  }>
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== "parent") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await connectDB()

  // pull in the subjects they signed up for, plus any teacher assignments
  const parent = await User.findById(session.user.id)
    .select(
      "parentProfile.interestedInLearning " +
      "parentProfile.subjects " +
      "parentProfile.assignedTeachers"
    )
    .populate({
      path: "parentProfile.assignedTeachers.teacherId",
      select: "name email teacherProfile.rating"
    })
    .lean() as ParentDocument

  if (!parent?.parentProfile?.interestedInLearning) {
    // not opted in, return empty
    return NextResponse.json([] as CourseArea[])
  }

  const subjects = parent.parentProfile.subjects || []
  const assignments = parent.parentProfile.assignedTeachers || []

  // Group them by area, just like the student route did
  const coursesByArea = subjects.reduce<CourseArea[]>((acc, subject) => {
    // find the teacher assignment for this subject
    const assign = assignments.find(a =>
      a.subjects.some(s => s.name === subject.name && s.area === subject.area)
    )
    if (!assign) {
      return acc // skip if no teacher assigned
    }

    // find the subject entry in that assignment (to get area)
    const subjEntry = assign.subjects.find(
      s => s.name === subject.name && s.area === subject.area
    )!

    // initialize this area bucket if needed
    let areaBucket = acc.find(a => a.area === subject.area)
    if (!areaBucket) {
      areaBucket = { area: subject.area, subjects: [] }
      acc.push(areaBucket)
    }

    areaBucket.subjects.push({
      id: `${subject.area}-${subject.name}`,        // or any unique key
      name: subject.name,
      teacher: {
        id: assign.teacherId._id,
        name: assign.teacherId.name,
        email: assign.teacherId.email
      },
      progress: 0
    })

    return acc
  }, [])

  return NextResponse.json(coursesByArea)
}
