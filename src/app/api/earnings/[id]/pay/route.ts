import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Earning } from "@/models/earning"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  await connectDB()
  const earning = await Earning.findById(params.id)
  if (!earning) {
    return NextResponse.json({ error: "Earning not found" }, { status: 404 })
  }
  if (earning.status === "paid") {
    return NextResponse.json({ error: "Already paid" }, { status: 400 })
  }
  earning.status = "paid"
  earning.paidAt = new Date()
  await earning.save()
  return NextResponse.json({ success: true })
}
