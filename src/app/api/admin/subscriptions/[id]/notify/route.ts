import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Subscription } from "@/models/subscription"
import { User } from "@/models/user"
import sendEmail from "@/lib/sendSmtpMail"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { searchParams } = new URL(req.url)
  await connectDB()
  const sub = await Subscription.findById(params.id).populate("userId", "email name")
  if (!sub) return NextResponse.json({ error: "Subscription not found" }, { status: 404 })
  const user = sub.userId
  if (!user?.email) return NextResponse.json({ error: "User email not found" }, { status: 404 })

  try {
    // Compute daysLabel for pluralization (HTML cannot do logic)
    const days = Number(searchParams.get("days") || "0")
    const daysLabel = days === 1 ? "" : "s"
    await sendEmail({
      to: user.email,
      subject: `Your Workmate Subscription is expiring in ${days} day${daysLabel}`,
      template: "subscription-expiry",
      replacements: {
        name: user.name || "User",
        days: days.toString(),
        daysLabel,
        endDate: new Date(sub.endDate).toLocaleDateString(),
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/parent/subscription`
      }
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
