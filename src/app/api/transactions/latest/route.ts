import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Transaction } from "@/models/transaction"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 })
  }
  await connectDB()
  // Only return the most recent *completed* transaction
  const transaction = await Transaction.findOne({ userId, status: "completed" })
    .sort({ createdAt: -1 })
    .lean()
  return NextResponse.json({ transaction })
}
