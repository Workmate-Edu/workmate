import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/user"
import sendEmail from "@/lib/sendSmtpMail"

export async function POST(
  req: Request,
  { params }: { params: { teacherId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { status, reason, feedback } = await req.json()

    // Validate reason and feedback for rejections
    if (status === 'rejected' && (!reason || !feedback)) {
      return NextResponse.json({ 
        error: "Reason and feedback are required for rejections" 
      }, { status: 400 })
    }
    
    const cooldownPeriod = 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds

    const updateData = {
      'teacherProfile.verificationStatus': status,
      $push: {
        'teacherProfile.verificationHistory': {
          status,
          date: new Date(),
          adminId: session.user.id,
          reason,
          feedback,
          canReapplyAfter: status === 'rejected' ? new Date(Date.now() + cooldownPeriod) : null
        }
      }
    }

    if (status === 'rejected') {
      updateData.$inc = { 'teacherProfile.reapplicationCount': 1 }
    }

    const teacher = await User.findByIdAndUpdate(
      params.teacherId,
      updateData,
      { new: true }
    )

    // Send appropriate email based on status
    if (status === 'verified') {
      await sendEmail({
        to: teacher.email,
        template: 'teacher-verification-approved',
        subject: 'Your Teacher Application has been Approved!',
        replacements: {
          name: teacher.name,
          loginUrl: process.env.NEXTAUTH_URL,
          dashboardUrl: `${process.env.NEXTAUTH_URL}/dashboard/teacher`
        }
      })
    } else if (status === 'rejected') {
      // Create the complete update profile URL
      const updateProfileUrl = `${process.env.NEXTAUTH_URL}/dashboard/teacher/profile?action=reapply`

      await sendEmail({
        to: teacher.email,
        template: 'teacher-rejection',
        subject: 'Teacher Verification Update',
        replacements: {
          name: teacher.name,
          feedback,
          reason,
          updateProfileUrl, // Pass the complete URL
          loginUrl: process.env.NEXTAUTH_URL // Keep this for backward compatibility
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[TEACHER_VERIFY_ERROR]', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
