// src/app/api/earnings/admin/pay-month/route.ts
import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Earning } from "@/models/earning"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { teacherId, month } = await req.json()
  if (!teacherId || !month) {
    return NextResponse.json({ error: "Missing teacherId or month" }, { status: 400 })
  }
  await connectDB()
  // Construct date range: month-start → next-month-start
  const start = new Date(`${month}-01T00:00:00Z`)
  const end = new Date(start)
  end.setMonth(start.getMonth() + 1)

  const result = await Earning.updateMany(
    {
      teacherId,
      date: { $gte: start, $lt: end },
      status: "pending"
    },
    { $set: { status: "paid", paidAt: new Date() } }
  )

  return NextResponse.json({ success: true, modifiedCount: result.modifiedCount })
}
