import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { Availability } from "@/models/availability"
import { User } from "@/models/user"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  await connectDB()
  // Fetch user profile to determine type
  const user = await User.findById(session.user.id).lean()
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }
  // If independent, fetch by own id
  if (user.studentProfile?.registeredAs === "independent") {
    const availability = await Availability.findOne({ childId: session.user.id })
    if (!availability) {
      return NextResponse.json({ error: "No availability found" }, { status: 404 })
    }
    return NextResponse.json(availability)
  }
  // If child, fetch by own id (parent created for this child)
  if (user.studentProfile?.registeredAs === "child") {
    const availability = await Availability.findOne({ childId: session.user.id })
    if (!availability) {
      return NextResponse.json({ error: "No availability found" }, { status: 404 })
    }
    return NextResponse.json(availability)
  }
  // If not a student type we recognize
  return NextResponse.json({ error: "Not a valid student type" }, { status: 403 })
}

// Allow independent students to create/update their own availability
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  await connectDB()
  const user = await User.findById(session.user.id).lean()
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }
  if (user.studentProfile?.registeredAs !== "independent") {
    return NextResponse.json({ error: "Only independent students can set their own availability" }, { status: 403 })
  }

  const body = await req.json()
  const { days, validFrom, validTo, timezone } = body

  if (!Array.isArray(days) || !validFrom || !validTo || !timezone) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  // Upsert (create or update) availability for this student
  const availability = await Availability.findOneAndUpdate(
    { childId: session.user.id },
    {
      childId: session.user.id,
      days,
      validFrom,
      validTo,
      timezone,
      updatedAt: new Date()
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )

  return NextResponse.json(availability)
}
