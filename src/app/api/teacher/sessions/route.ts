import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/user"
import { TeachingSession } from "@/models/teaching-session"
import sendEmail from "@/lib/sendSmtpMail"
import mongoose from 'mongoose'
import { format, addDays, addWeeks, differenceInDays } from 'date-fns'
import { generateICS, generateGoogleCalendarLink, generateOutlookCalendarLink } from "@/lib/calendar-utils"
import { TeacherSchedule } from "@/models/schedule"
import { sendSessionNotification } from "@/lib/notification-service";

// Add proper interfaces
interface RecurrenceInfo {
  isRecurring: boolean;
  pattern: 'daily' | 'weekly' | 'twice-weekly' | 'bi-weekly';
  daysOfWeek: number[];
  startDate: Date;
  endDate: Date;
  totalSessions: number;
}

interface TeachingSessionInput {
  teacherId: string;
  studentId: string;
  subject: {
    name: string;
    area: string;
  };
  startTime: Date;
  endTime: Date;
  duration: number;
  meetingLink: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  recurrence?: RecurrenceInfo;
}

// Helper for date formatting
const formatDateTime = (date: Date) => ({
  date: format(date, 'PPP'),
  time: format(date, 'p'),
  iso: date.toISOString(),
  formatForCalendar: format(date, "yyyyMMdd'T'HHmmss'Z'")
})

function validateDates(startTime: string, duration: number, recurrence?: any) {
  const startDate = new Date(startTime)
  if (isNaN(startDate.getTime())) {
    throw new Error('Invalid start time')
  }

  const endDate = new Date(startDate.getTime() + (duration * 60 * 1000))
  if (isNaN(endDate.getTime())) {
    throw new Error('Invalid duration')
  }

  if (recurrence?.endsOn) {
    const recurrenceEnd = new Date(recurrence.endsOn)
    if (isNaN(recurrenceEnd.getTime())) {
      throw new Error('Invalid recurrence end date')
    }
    if (recurrenceEnd < startDate) {
      throw new Error('Recurrence end date must be after start date')
    }
  }

  return { startDate, endDate }
}

// Helper functions
function formatEmailData(teacher, subjectName, startDate, duration, meetingLink, students, recurrence, GOOGLE_MEET_MAX_DAYS) {
  return {
    teacherName: teacher.name,
    subject: subjectName,
    area: teacher.teacherProfile.subjects[0].area,
    sessionDate: startDate.toLocaleString('en-US', { dateStyle: 'full' }),
    sessionTime: startDate.toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }),
    duration: duration.toString(),
    meetingLink,
    studentsCount: students.length.toString(),
    students: students.map(s => s.name).join(", "),
    
    // Recurrence info
    scheduleType: recurrence?.pattern !== 'none' 
      ? `${recurrence.pattern.charAt(0).toUpperCase()}${recurrence.pattern.slice(1)}` 
      : 'One-time Session',
    scheduleDays: recurrence?.daysOfWeek?.length 
      ? recurrence.daysOfWeek.map(d => ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d]).join(', ')
      : 'N/A',
    scheduleEndDate: recurrence?.endsOn 
      ? new Date(recurrence.endsOn).toLocaleDateString('en-US', { dateStyle: 'full' })
      : 'N/A',
    
    // Styles
    recurringInfoStyle: recurrence?.pattern !== 'none' 
      ? 'margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;'
      : 'display: none;',
    warningStyle: recurrence?.pattern !== 'none'
      ? 'margin: 20px 0; padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107;'
      : 'display: none;',
    meetingWarning: recurrence?.pattern !== 'none'
      ? `Note: Google Meet links expire after ${GOOGLE_MEET_MAX_DAYS} days. You will receive new meeting links as needed.`
      : ''
  }
}

// Route Handlers
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'teacher') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    console.log('Fetching sessions for teacher:', session.user.id)

    const sessions = await TeachingSession.find({
      teacherId: session.user.id
    })
    .populate('studentId', 'name email studentProfile')
    .sort({ startTime: 1 })
    .lean()

    console.log('Found sessions:', sessions.length)

    const formattedSessions = sessions.map(s => ({
      id: s._id,
      student: {
        id: s.studentId?._id,
        name: s.studentId?.name,
        email: s.studentId?.email,
        grade: s.studentId?.studentProfile?.grade
      },
      subject: s.subject,
      startTime: s.startTime,
      endTime: s.endTime,
      duration: s.duration,
      meetingLink: s.meetingLink,
      status: s.status,
      recurrence: s.recurrence,
      isPastDue: new Date(s.startTime) < new Date()
    }))

    return NextResponse.json(formattedSessions)

  } catch (error) {
    console.error('[TEACHER_SESSIONS_GET]', error)
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    )
  }
}

function calculateTotalSessions(startDate: Date, recurrence: any) {
  if (!recurrence?.isRecurring || !recurrence.endDate) return 1

  const start = new Date(startDate)
  const end = new Date(recurrence.endDate)
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  const totalWeeks = Math.ceil(totalDays / 7)

  switch (recurrence.pattern) {
    case 'daily':
      return totalDays
    case 'weekly':
      return totalWeeks
    case 'twice-weekly':
      // Count actual occurrences based on selected days
      if (recurrence.daysOfWeek?.length) {
        return totalWeeks * recurrence.daysOfWeek.length
      }
      return totalWeeks * 2
    case 'bi-weekly':
      return Math.ceil(totalWeeks / 2)
    default:
      return 1
  }
}

export async function POST(req: Request) {
  try {
    const authSession = await getServerSession(authOptions)
    if (!authSession?.user || authSession.user.role !== 'teacher') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { 
      courseId, 
      startTime, 
      duration, 
      students: studentIds,
      externalLink,
      recurrence
    } = await req.json()

    // Extract subject info from courseId (e.g., "67eab75d6f9ce9391b9acbd6-arabic")
    const [subjectId, subjectName] = courseId.split('-')
    
    await connectDB()

    // Get teacher profile - only need subject areas to determine area
    const teacher = await User.findById(authSession.user.id)
      .select('name email teacherProfile.subjects')
      .lean()

    // Find subject area
    const subjectArea = teacher.teacherProfile.subjects.find(area => 
      area.subjects.includes(subjectName.toLowerCase())
    )

    if (!subjectArea) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 })
    }

    // Calculate session times
    const sessionStartTime = new Date(startTime)
    const sessionEndTime = new Date(sessionStartTime.getTime() + duration * 60000)

    // Generate or use provided meeting link
    const meetingLink = externalLink || `https://meet.google.com/${Math.random().toString(36).substring(7)}`

    // Calculate total sessions with improved logging
    const totalSessions = calculateTotalSessions(
      sessionStartTime,
      {
        isRecurring: recurrence?.isRecurring,
        pattern: recurrence?.pattern,
        daysOfWeek: recurrence?.daysOfWeek,
        endDate: recurrence?.endsOn
      }
    )

    console.log('Session calculation:', {
      pattern: recurrence?.pattern,
      startDate: sessionStartTime.toISOString(),
      endDate: recurrence?.endsOn,
      daysOfWeek: recurrence?.daysOfWeek,
      totalSessions
    })

    // Create sessions with calculated total
    const teachingSessions = await Promise.all(
      studentIds.map(async (studentId: string) => {
        const student = await User.findById(studentId)
          .select('name email studentProfile.registeredAs studentProfile.parent')
          .populate({
            path: 'studentProfile.parent',
            select: 'name email'
          })
          .lean();

        if (!student) {
          throw new Error(`Student ${studentId} not found`);
        }

        const isChild = student.studentProfile?.registeredAs === 'child';
        const parentData = isChild ? student.studentProfile?.parent : null;

        // Create session with proper typing
        const session = await TeachingSession.create({
          teacherId: authSession.user.id,
          studentId,
          subject: {
            name: subjectName.toLowerCase(),
            area: subjectArea.area
          },
          startTime: sessionStartTime,
          endTime: sessionEndTime,
          duration,
          meetingLink,
          status: 'scheduled',
          recurrence: recurrence?.isRecurring ? {
            isRecurring: true,
            pattern: recurrence.pattern,
            daysOfWeek: recurrence.daysOfWeek,
            startDate: sessionStartTime,
            endDate: new Date(recurrence.endsOn),
            totalSessions
          } : undefined
        } as TeachingSessionInput);

        // Send notifications with proper typing
        await Promise.all([
          // Teacher notification
          sendSessionNotification({
            userId: authSession.user.id,
            type: 'session_created',
            title: 'New Session Created',
            message: `Session created with ${student.name} for ${session.subject.name}`,
            data: { sessionId: session._id }
          }),

          // Student notification
          sendSessionNotification({
            userId: studentId,
            type: 'session_created',
            title: 'New Session Scheduled',
            message: `${teacher.name} scheduled a ${session.subject.name} session`,
            data: { sessionId: session._id }
          }),

          // Parent notification
          parentData && sendSessionNotification({
            userId: parentData._id.toString(),
            type: 'session_created',
            title: `New Session for ${student.name}`,
            message: `${teacher.name} scheduled a ${session.subject.name} session for ${student.name}`,
            data: { sessionId: session._id }
          })
        ]);

        // Prepare recurrence info for emails
        const recurrenceInfo = session.recurrence?.isRecurring 
          ? {
              recurrencePattern: session.recurrence.pattern,
              recurrenceDays: session.recurrence.daysOfWeek
                .map(d => ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d])
                .join(', '),
              recurrenceEndDate: format(new Date(session.recurrence.endDate), 'PPP'),
              recurrenceStyle: 'display: block;'
            }
          : {
              recurrencePattern: '',
              recurrenceDays: '',
              recurrenceEndDate: '',
              recurrenceStyle: 'display: none;'
            }

        // Send emails
        await Promise.all([
          // Send teacher email
          sendEmail({
            to: teacher.email,
            subject: `New Session Created: ${session.subject.name}`,
            template: "session-notification",
            replacements: {
              notificationType: 'New Session Created',
              recipientName: teacher.name,
              mainMessage: `You have created a new teaching session.`,
              subject: session.subject.name,
              sessionDate: format(session.startTime, 'PPP'),
              sessionTime: format(session.startTime, 'p'),
              duration: session.duration.toString(),
              teacherName: teacher.name,
              studentName: student.name,
              meetingLink: session.meetingLink,
              ...recurrenceInfo
            }
          }),

          // Send student email
          sendEmail({
            to: student.email,
            subject: `New Session Scheduled: ${session.subject.name}`,
            template: "session-notification",
            replacements: {
              notificationType: 'New Session Scheduled',
              recipientName: student.name,
              mainMessage: `${teacher.name} has scheduled a new session for you.`,
              subject: session.subject.name,
              sessionDate: format(session.startTime, 'PPP'),
              sessionTime: format(session.startTime, 'p'),
              duration: session.duration.toString(),
              teacherName: teacher.name,
              studentName: student.name,
              meetingLink: session.meetingLink,
              ...recurrenceInfo
            }
          }),

          // Send parent email if student is registered as child
          parentData && sendEmail({
            to: parentData.email,
            subject: `New Session Scheduled for ${student.name}: ${session.subject.name}`,
            template: "session-notification",
            replacements: {
              notificationType: `New Session Scheduled for ${student.name}`,
              recipientName: parentData.name,
              mainMessage: `${teacher.name} has scheduled a new session for ${student.name}.`,
              subject: session.subject.name,
              sessionDate: format(session.startTime, 'PPP'),
              sessionTime: format(session.startTime, 'p'),
              duration: session.duration.toString(),
              teacherName: teacher.name,
              studentName: student.name,
              meetingLink: session.meetingLink,
              ...recurrenceInfo
            }
          })
        ]);

        return session;
      })
    );

    return NextResponse.json({
      success: true,
      sessions: teachingSessions.map(s => s.toObject())
    })

  } catch (error) {
    console.error('[CREATE_SESSION_ERROR]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create session" },
      { status: 500 }
    )
  }
}
