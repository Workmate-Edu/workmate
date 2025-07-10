import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Subscription } from "@/models/subscription"

export async function GET() {
  await connectDB()
  const subscriptions = await Subscription.find({})
    .populate("userId", "name email")
    .populate("children", "name email")
    .lean()
  return NextResponse.json({ subscriptions })
}
