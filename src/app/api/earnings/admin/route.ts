import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Earning } from "@/models/earning"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  await connectDB()
  // Get all earnings, populate teacher info
  const earnings = await Earning.find({})
    .sort({ date: -1 })
    .populate("teacherId", "name email")
    .lean()
  return NextResponse.json(earnings)
}
