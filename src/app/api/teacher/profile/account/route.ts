import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/user"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  await connectDB()
  const { bankName, accountNumber, accountName, bvn } = await req.json()
  const user = await User.findById(session.user.id)
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }
  user.teacherProfile = user.teacherProfile || {}
  user.teacherProfile.accountDetails = {
    bankName,
    accountNumber,
    accountName,
    bvn
  }
  await user.save()
  return NextResponse.json({ success: true })
}
