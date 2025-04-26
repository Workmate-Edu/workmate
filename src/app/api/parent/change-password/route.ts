import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { resetPassword } from "@/lib/services/auth-service"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'parent') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { newPassword } = await req.json()
    if (!newPassword) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 })
    }

    await connectDB()

    await resetPassword({
      userId: session.user.id,
      password: newPassword,
    })

    return NextResponse.json({ 
      success: true,
      message: "Password updated successfully" 
    })

  } catch (error) {
    console.error('[PARENT_PASSWORD_CHANGE_ERROR]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to change password" },
      { status: 500 }
    )
  }
}
