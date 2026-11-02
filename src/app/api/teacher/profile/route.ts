import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/user"
import sendEmail from "@/lib/email"
import { notifyAdminsOfTeacherReview } from '@/lib/admin-teacher-review-notifications'
import { publicHttpsUrl } from '@/lib/safe-url'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const id = url.searchParams.get("id")

  if (!id) {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'teacher') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const teacher = await User.findById(session.user.id)
      .select("name email phone teacherProfile bio image role")
      .lean()
    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 })
    }
    return NextResponse.json(teacher)
  }

  await connectDB()
  // Public lookups intentionally expose only the limited profile fields below.
  const user = await User.findById(id)
    .select("name email teacherProfile bio image role")
    .lean()
  if (!user || user.role !== "teacher") {
    return NextResponse.json({ error: "Teacher not found" }, { status: 404 })
  }
  return NextResponse.json(user)
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'teacher') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const data = await req.json()
    const { bio, phone, image, teacherProfile } = data

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

    const requiresReverification = currentTeacher.teacherProfile?.verificationStatus !== 'pending'

    const rawVideoUrl = typeof teacherProfile?.introductionVideoUrl === 'string' ? teacherProfile.introductionVideoUrl.trim() : ''
    const introductionVideoUrl = rawVideoUrl ? publicHttpsUrl(rawVideoUrl) : ''
    if (rawVideoUrl && !introductionVideoUrl) return NextResponse.json({ error: 'Enter a public HTTPS introduction video link without embedded credentials' }, { status: 400 })
    if (image !== undefined && image !== '' && (typeof image !== 'string' || !image.startsWith('https://'))) {
      return NextResponse.json({ error: 'Choose a valid profile image' }, { status: 400 })
    }

    const updateData: any = {
      bio,
      phone,
      ...(image ? { image } : {}),
      'teacherProfile.subjects': teacherProfile.subjects,
      'teacherProfile.qualifications': teacherProfile.qualifications,
      ...(introductionVideoUrl ? { 'teacherProfile.introductionVideoUrl': introductionVideoUrl } : {}),
      'teacherProfile.lastUpdated': new Date(),
    }

    if (requiresReverification) {
      updateData['teacherProfile.verificationStatus'] = 'pending'
    }

    const update: any = { $set: updateData }
    if (image === '' || !introductionVideoUrl) {
      update.$unset = {
        ...(image === '' ? { image: 1 } : {}),
        ...(!introductionVideoUrl ? { 'teacherProfile.introductionVideoUrl': 1 } : {}),
      }
    }
    if (requiresReverification) {
      update.$push = {
        'teacherProfile.verificationHistory': {
          status: 'pending',
          date: new Date(),
          note: 'Profile updated and submitted for re-verification'
        }
      }
    }

    const updatedTeacher = await User.findByIdAndUpdate(
      session.user.id,
      update,
      { new: true }
    ).select('name email phone bio teacherProfile')

    const notifications = [
      sendEmail({
        to: updatedTeacher.email,
        subject: 'Profile update received - review pending',
        template: 'teacher-reverification',
        replacements: {
          teacherName: updatedTeacher.name,
          dashboardUrl: `${process.env.NEXTAUTH_URL}/dashboard/teacher`,
        }
      }),
      notifyAdminsOfTeacherReview({ id: String(updatedTeacher._id), name: updatedTeacher.name, email: updatedTeacher.email }, 'profile_update')
    ]
    const results = await Promise.allSettled(notifications)
    results.forEach((result, index) => {
      if (result.status === 'rejected') console.error(`[TEACHER_PROFILE_NOTIFICATION_ERROR] Notification ${index + 1} failed`, result.reason)
    })

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
  
