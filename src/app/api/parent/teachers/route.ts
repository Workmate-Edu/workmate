// app/api/parent/teachers/route.ts

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/user"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "parent") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await connectDB()

  // 1. Load the parent’s profile
  const parent = await User.findById(session.user.id)
    .select("parentProfile.interestedInLearning parentProfile.subjects")
    .lean()

  if (!parent) {
    return NextResponse.json({ error: "Parent not found" }, { status: 404 })
  }

  const { interestedInLearning, subjects: parentSubjects } = parent.parentProfile || {}

  // 2. If they’re not “learning” or have no subjects, return empty
  if (!interestedInLearning || !Array.isArray(parentSubjects) || parentSubjects.length === 0) {
    return NextResponse.json([], { status: 200 })
  }

  // 3. Find any teacher whose teacherProfile.subjects overlap
  const teachers = await User.find({
    role: "teacher",
    "teacherProfile.subjects.subjects": { $in: parentSubjects }
  })
    .select("name email phone language teacherProfile.rating teacherProfile.qualifications teacherProfile.subjects")
    .lean()

  // 4. Format for the client
  const result = teachers.map(t => ({
    id: t._id,
    name: t.name,
    email: t.email,
    phone: t.phone,
    language: t.language,
    rating: t.teacherProfile?.rating ?? 0,
    qualifications: t.teacherProfile?.qualifications || [],
    // only return the matching subjects
    subjects: (t.teacherProfile?.subjects || [])
      .flatMap(areaBlock =>
        areaBlock.subjects.filter(subj => parentSubjects.includes(subj))
      )
  }))

  return NextResponse.json(result)
}
