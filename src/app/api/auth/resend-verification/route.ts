import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/user"
import { generateVerificationToken } from "@/lib/tokens"
import sendEmail from "@/lib/sendSmtpMail"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    await connectDB()

    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: "Email already verified" }, { status: 400 })
    }

    // Generate new token
    const token = await generateVerificationToken(user._id)

    // Send new verification email
    await sendEmail({
      to: user.email,
      template: 'verify-email',
      subject: 'Verify your email address',
      replacements: {
        name: user.name,
        token
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[RESEND_VERIFICATION_ERROR]', error)
    return NextResponse.json(
      { error: "Failed to resend verification" }, 
      { status: 500 }
    )
  }
}
