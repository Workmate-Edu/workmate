import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/user"
import { sendAssignmentNotifications } from "@/lib/email-service" // Fix import
import sendEmail from "@/lib/sendSmtpMail"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'teacher') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const teacher = await User.findById(session.user.id)
      .select('name email phone bio teacherProfile') // Updated to include phone
      .lean()

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 })
    }

    return NextResponse.json(teacher)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'teacher') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const data = await req.json()
    const { bio, phone, teacherProfile } = data

    if (!bio || !phone || !teacherProfile?.subjects?.length) {
      return NextResponse.json({ 
        error: "Missing required fields",
        details: { 
          bio: !!bio,
          phone: !!phone,
          subjects: teacherProfile?.subjects?.length 
        }
      }, { status: 400 })
    }

    const currentTeacher = await User.findById(session.user.id)
      .select('teacherProfile.verificationStatus name email teacherProfile.verificationHistory')
      .lean()

    if (!currentTeacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 })
    }

    const wasRejected = currentTeacher.teacherProfile?.verificationStatus === 'rejected'

    const updateData = {
      bio,
      phone,
      'teacherProfile.subjects': teacherProfile.subjects,
      'teacherProfile.qualifications': teacherProfile.qualifications,
      'teacherProfile.lastUpdated': new Date(),
    }

    if (wasRejected) {
      updateData['teacherProfile.verificationStatus'] = 'pending'
      updateData.$push = {
        'teacherProfile.verificationHistory': {
          status: 'pending',
          date: new Date(),
          note: 'Profile updated and resubmitted for verification'
        }
      }
    }

    const updatedTeacher = await User.findByIdAndUpdate(
      session.user.id,
      wasRejected ? updateData : { $set: updateData },
      { new: true }
    ).select('name email phone bio teacherProfile')

    if (wasRejected) {
      try {
        await sendEmail({
          to: updatedTeacher.email,
          subject: "Profile Re-verification",
          template: "teacher-reverification", 
          replacements: {
            teacherName: updatedTeacher.name,
            email: updatedTeacher.email,
          }
        })
      } catch (emailError) {
        console.error('Failed to send re-verification email:', emailError)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      teacher: updatedTeacher
    })

  } catch (error) {
    console.error('[TEACHER_PROFILE_UPDATE_ERROR]', error)
    return NextResponse.json({ 
      error: "Failed to update profile",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}
