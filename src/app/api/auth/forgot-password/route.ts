import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/user"
import { generateToken } from "@/templates/authTemplates"
import sendEmail from "@/lib/sendSmtpMail"

export async function POST(req: Request) {
  try {
    await connectDB()
    const { email } = await req.json()

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return NextResponse.json(
        { error: "No user found with this email" },
        { status: 400 }
      )
    }

    const resetToken = generateToken(user._id.toString())
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`

    await sendEmail({
      to: user.email,
      subject: "Reset your Workmate password",
      template: "passwordReset",
      replacements: {
        userName: user.name,
        passwordResetLink: resetUrl
      }
    })

    return NextResponse.json({
      message: "Reset password link sent to your email",
      success: true
    })
  } catch (error) {
    console.error("[FORGOT_PASSWORD_ERROR]", error)
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    )
  }
}

