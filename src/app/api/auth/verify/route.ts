import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb" // Changed from default import
import { User } from "@/models/user"
import { verifyToken } from "@/lib/tokens"

export async function POST(req: Request) {
  try {
    await connectDB()
    const { token } = await req.json()

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      )
    }

    const decoded = verifyToken(token)
    const user = await User.findByIdAndUpdate(
      decoded.userId,
      { emailVerified: true },
      { new: true }
    )

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Email verified successfully"
    })

  } catch (error) {
    console.error("[VERIFY_ERROR]", error)
    return NextResponse.json(
      { error: "Failed to verify email" },
      { status: 500 }
    )
  }
}
