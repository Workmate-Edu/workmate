import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/user"
import sendEmail from "@/lib/sendSmtpMail"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'parent') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const parent = await User.findById(session.user.id)
      .select('name email username phone parentProfile.educationLevel')
      .lean()

    if (!parent) {
      return NextResponse.json({ error: "Parent not found" }, { status: 404 })
    }

    return NextResponse.json(parent)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'parent') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const data = await req.json()
    const { name, phone, parentProfile } = data

    if (!phone) {
      return NextResponse.json({ 
        error: "Missing required fields",
        details: { phone: !!phone }
      }, { status: 400 })
    }

    const updateData = {
      name,
      phone,
      'parentProfile.educationLevel': parentProfile.educationLevel,
      'parentProfile.lastUpdated': new Date()
    }

    const updatedParent = await User.findByIdAndUpdate(
      session.user.id,
      { $set: updateData },
      { new: true }
    ).select('name email phone parentProfile')

    // Log the update
    console.log('Parent profile updated:', {
      parentId: session.user.id,
      timestamp: new Date()
    })

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      parent: updatedParent
    })

  } catch (error) {
    console.error('[PARENT_PROFILE_UPDATE_ERROR]', error)
    return NextResponse.json({ 
      error: "Failed to update profile",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}
