import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/user"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'teacher') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Get the current teacher and check their status
    const teacher = await User.findById(session.user.id)
    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 })
    }

    if (teacher.teacherProfile?.verificationStatus !== 'rejected') {
      return NextResponse.json({ 
        error: "Can only reapply when profile is rejected" 
      }, { status: 400 })
    }

    // Update the teacher's verification status
    const updatedTeacher = await User.findByIdAndUpdate(
      session.user.id,
      {
        $set: {
          'teacherProfile.verificationStatus': 'pending'
        },
        $push: {
          'teacherProfile.verificationHistory': {
            status: 'pending',
            date: new Date(),
            note: 'Profile resubmitted for verification'
          }
        },
        $inc: {
          'teacherProfile.reapplicationCount': 1
        }
      },
      { new: true }
    ).select('teacherProfile.verificationStatus teacherProfile.reapplicationCount')

    console.log('Teacher reapplication:', {
      teacherId: session.user.id,
      status: 'pending',
      reapplicationCount: updatedTeacher.teacherProfile.reapplicationCount,
      timestamp: new Date()
    })

    return NextResponse.json({ 
      success: true,
      message: "Profile resubmitted for verification",
      verificationStatus: updatedTeacher.teacherProfile.verificationStatus,
      reapplicationCount: updatedTeacher.teacherProfile.reapplicationCount
    })
  } catch (error) {
    console.error('[TEACHER_REAPPLY_ERROR]', error)
    return NextResponse.json({ 
      error: "Failed to reapply",
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 })
  }
}
