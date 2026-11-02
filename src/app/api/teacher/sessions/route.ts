import { publishIntroductionSchema } from '@/lib/introduction-booking';
import { scheduleTransaction, assertScheduleAvailable, sessionOccurrences, recurrenceEnd, SchedulingError } from '@/lib/scheduling';
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/user"
import { TeachingSession } from "@/models/teaching-session"
import sendEmail from "@/lib/sendSmtpMail"
import mongoose from 'mongoose'
import { format } from 'date-fns/format'
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


// Route Handlers
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'teacher') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const sessions = await TeachingSession.find({
      teacherId: session.user.id
    })
    .populate('studentId', 'name studentProfile.grade')
    .sort({ startTime: 1 })
    .lean()

    const formattedSessions = sessions.map(s => ({
      id: s._id,
      student: {
        id: s.studentId?._id,
        name: s.studentId?.name,
        grade: s.studentId?.studentProfile?.grade
      },
      subject: s.subject,
      startTime: s.startTime,
      endTime: s.endTime,
      duration: s.duration,
      meetingLink: s.meetingLink,
      status: s.status,
      recurrence: s.recurrence,
      timezone: s.timezone,
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
  if (!recurrence?.isRecurring || !recurrence.endDate) return 1;

  const start = new Date(startDate);
  const end = new Date(recurrence.endDate);
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const totalWeeks = Math.ceil(totalDays / 7);

  switch (recurrence.pattern) {
    case 'daily':
      return totalDays;
    case 'weekly':
      return totalWeeks;
    case 'multiple-days':
      if (recurrence.daysOfWeek?.length) {
        return totalWeeks * recurrence.daysOfWeek.length;
      }
      return totalWeeks;
    case 'bi-weekly':
      return Math.ceil(totalWeeks / 2);
    default:
      return 1;
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
      timezone,
      recurrence
    } = await req.json()

    // Extract subject info from courseId (e.g., "67eab75d6f9ce9391b9acbd6-arabic")
    const [subjectId, subjectName] = courseId.split('-')
    
    await connectDB()

    // Get teacher profile - only need subject areas to determine area
    const teacher: any = await User.findById(authSession.user.id)
      .select('name email teacherProfile.subjects')
      .lean()

    if (!teacher?.teacherProfile) return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 });

    // Find subject area
    const subjectArea = teacher.teacherProfile.subjects.find((area: any) =>
      area.subjects.includes(subjectName.toLowerCase())
    )

    if (!subjectArea) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 })
    }

    // Calculate session times
    const sessionStartTime = new Date(startTime)
    const sessionEndTime = new Date(sessionStartTime.getTime() + duration * 60000)

    // Generate or use provided meeting link
    const meetingLink = externalLink;
    if (!publishIntroductionSchema.shape.meetingLink.safeParse(meetingLink).success) return NextResponse.json({ error: 'Provide a real HTTPS meeting link' }, { status: 400 });

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

    // Process recurring sessions
    const prepared = studentIds.map((studentId: string) => {
      const sessionData: any = {
        teacherId: authSession.user.id,
        studentId,
        subject: {
          name: subjectName.toLowerCase(),
          area: subjectArea.area
        },
        startTime: sessionStartTime,
        endTime: sessionEndTime,
        duration,
        timezone, // <-- store timezone as provided
        meetingLink,
        status: 'scheduled'
      };

      if (recurrence?.isRecurring) {
        const recurrenceData = {
          isRecurring: true,
          pattern: recurrence.pattern,
          daysOfWeek: recurrence.pattern === 'multiple-days' || recurrence.pattern === 'weekly'
            ? (recurrence.daysOfWeek || []).slice().sort((a: number, b: number) => a - b)
            : [],
          startDate: sessionStartTime,
          endDate: recurrenceEnd(recurrence.endsOn, timezone),
          totalSessions: calculateTotalSessions(
            sessionStartTime,
            {
              isRecurring: true,
              pattern: recurrence.pattern,
              daysOfWeek: recurrence.daysOfWeek,
              endDate: recurrenceEnd(recurrence.endsOn, timezone)
            }
          )
        };

        sessionData.recurrence = recurrenceData;

        console.log('Creating recurring session with data:', {
          pattern: recurrenceData.pattern,
          daysOfWeek: recurrenceData.daysOfWeek,
          startDate: recurrenceData.startDate,
          endDate: recurrenceData.endDate,
          totalSessions: recurrenceData.totalSessions
        });
      }

      return sessionData;
    });
    if (!prepared.length) return NextResponse.json({ error: 'Select at least one student' }, { status: 400 });
    const createdSessions = await scheduleTransaction(authSession.user.id, async transaction => {
      await assertScheduleAvailable(authSession.user.id, sessionOccurrences(prepared[0]), transaction);
      return TeachingSession.create(prepared, { session: transaction });
    });
    const sessions = await Promise.all(createdSessions.map(async (createdSession: any) => {
      const studentId = String(createdSession.studentId);

      // Log created session for verification
      console.log('Session created with recurrence:', {
        sessionId: createdSession._id,
        recurrence: createdSession.recurrence
      });

      const student: any = await User.findById(studentId)
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

      // Send notifications with proper typing
      await Promise.all([
        // Teacher notification
        sendSessionNotification({
          userId: authSession.user.id,
          type: 'session_created',
          title: 'New Session Created',
          message: `Session created with ${student.name} for ${createdSession.subject.name}`,
          data: { sessionId: createdSession._id }
        }),

        // Student notification
        sendSessionNotification({
          userId: studentId,
          type: 'session_created',
          title: 'New Session Scheduled',
          message: `${teacher.name} scheduled a ${createdSession.subject.name} session`,
          data: { sessionId: createdSession._id }
        }),

        // Parent notification
        parentData && sendSessionNotification({
          userId: parentData._id.toString(),
          type: 'session_created',
          title: `New Session for ${student.name}`,
          message: `${teacher.name} scheduled a ${createdSession.subject.name} session for ${student.name}`,
          data: { sessionId: createdSession._id }
        })
      ]);

      // Format days for email
      const getDayName = (day: number) => [
        'Sunday', 'Monday', 'Tuesday', 'Wednesday', 
        'Thursday', 'Friday', 'Saturday'
      ][day];

      const formatSelectedDays = (days: number[] = []) => 
        days.map(getDayName).join(', ');

      // Update email template data
      const recurrenceInfo = createdSession.recurrence?.isRecurring 
        ? {
            recurrencePattern: createdSession.recurrence.pattern === 'multiple-days' 
              ? 'Multiple Days Per Week'
              : createdSession.recurrence.pattern,
            selectedDays: formatSelectedDays(createdSession.recurrence.daysOfWeek),
            recurrenceEndDate: format(new Date(createdSession.recurrence.endDate), 'PPP'),
            recurringStyle: 'display: block;'
          }
        : {
            recurrencePattern: '',
            selectedDays: '',
            recurrenceEndDate: '',
            recurringStyle: 'display: none;'
          }

      // Send emails
      await Promise.all([
        // Send teacher email
        sendEmail({
          to: teacher.email,
          subject: `Session Created: ${createdSession.subject.name}`,
          template: "session-notification",
          replacements: {
            notificationType: `Session Created: ${createdSession.subject.name}`,
            recipientName: teacher.name,
            mainMessage: `You have created a new teaching session.`,
            subject: createdSession.subject.name,
            sessionDate: format(createdSession.startTime, 'PPP'),
            sessionTime: format(createdSession.startTime, 'p'),
            duration: createdSession.duration.toString(),
            teacherName: teacher.name,
            studentName: student.name,
            meetingLink: createdSession.meetingLink,
            ...recurrenceInfo
          }
        }),

        // Send student email
        sendEmail({
          to: student.email,
          subject: `New Session Scheduled: ${createdSession.subject.name}`,
          template: "session-notification",
          replacements: {
            notificationType: 'New Session Scheduled',
            recipientName: student.name,
            mainMessage: `${teacher.name} has scheduled a new session for you.`,
            subject: createdSession.subject.name,
            sessionDate: format(createdSession.startTime, 'PPP'),
            sessionTime: format(createdSession.startTime, 'p'),
            duration: createdSession.duration.toString(),
            teacherName: teacher.name,
            studentName: student.name,
            meetingLink: createdSession.meetingLink,
            ...recurrenceInfo
          }
        }),

        // Send parent email if student is registered as child
        parentData && sendEmail({
          to: parentData.email,
          subject: `New Session Scheduled for ${student.name}: ${createdSession.subject.name}`,
          template: "session-notification",
          replacements: {
            notificationType: `New Session Scheduled for ${student.name}`,
            recipientName: parentData.name,
            mainMessage: `${teacher.name} has scheduled a new session for ${student.name}.`,
            subject: createdSession.subject.name,
            sessionDate: format(createdSession.startTime, 'PPP'),
            sessionTime: format(createdSession.startTime, 'p'),
            duration: createdSession.duration.toString(),
            teacherName: teacher.name,
            studentName: student.name,
            meetingLink: createdSession.meetingLink,
            ...recurrenceInfo
          }
        })
      ]);

      return createdSession;
    }));

    return NextResponse.json({
      success: true,
      sessions: sessions.map(s => s.toObject())
    })

  } catch (error) {
    console.error('[CREATE_SESSION_ERROR]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create session" },
      { status: 500 }
    )
  }
}
