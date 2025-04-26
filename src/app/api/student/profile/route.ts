import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/user"
import sendEmail from "@/lib/sendSmtpMail"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'student') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const student = await User.findById(session.user.id)
      .select('name email phone studentProfile')  // Include phone in selection
      .lean()

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    return NextResponse.json({
      name: student.name,
      email: student.email,
      phone: student.phone,
      studentProfile: {
        grade: student.studentProfile?.grade || ''
      }
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'student') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const data = await req.json()
    const { name, phone, studentProfile } = data

    if (!studentProfile?.grade) {
      return NextResponse.json({ 
        error: "Missing required fields",
        details: { grade: !!studentProfile?.grade }
      }, { status: 400 })
    }

    const updateData = {
      name,
      phone,  // Include phone in update
      'studentProfile.grade': studentProfile.grade,
      'studentProfile.lastUpdated': new Date()
    }

    const updatedStudent = await User.findByIdAndUpdate(
      session.user.id,
      { $set: updateData },
      { new: true }
    ).select('name email phone studentProfile')

    // Log the update
    console.log('Student profile updated:', {
      studentId: session.user.id,
      timestamp: new Date()
    })

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      student: updatedStudent
    })

  } catch (error) {
    console.error('[STUDENT_PROFILE_UPDATE_ERROR]', error)
    return NextResponse.json({ 
      error: "Failed to update profile",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}
