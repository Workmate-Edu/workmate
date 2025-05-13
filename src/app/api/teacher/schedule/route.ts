import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectDB } from "@/lib/mongodb"
import { TeacherSchedule } from "@/models/schedule"
import authOptions from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session?.user?.role !== 'teacher') {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    await connectDB()

    // Get all schedules for teacher
    const schedules = await TeacherSchedule.find({
      teacherId: session.user.id
    })
    .populate('studentId', 'name email') // Populate student details
    .sort({ startTime: 1 }) // Sort by start time
    .lean()

    // Log for debugging
    console.log('Found schedules:', schedules?.length || 0)

    // Transform data for frontend
    const transformedSchedules = schedules.map(schedule => ({
      id: schedule._id,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      student: {
        id: schedule.studentId?._id,
        name: schedule.studentId?.name,
        email: schedule.studentId?.email
      },
      status: schedule.status,
      subject: schedule.subject,
      notes: schedule.notes
    }))

    return NextResponse.json(transformedSchedules)

  } catch (error) {
    console.error('[TEACHER_SCHEDULE_GET]', error)
    return NextResponse.json(
      { error: "Failed to fetch schedule" },
      { status: 500 }
    )
  }
}
