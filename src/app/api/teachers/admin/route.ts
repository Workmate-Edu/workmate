import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/user"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  await connectDB()
  // Get all teachers with account details
  const teachers = await User.find({ role: "teacher" })
    .select("name email teacherProfile.accountDetails teacherProfile.verificationStatus")
    .lean()
  return NextResponse.json(teachers)
}
