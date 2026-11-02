import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthSession } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/user';
import { CoordinatedIntroductionRequest } from '@/models/coordinated-introduction-request';
import { parentOnboardingSchema } from '@/lib/parent-onboarding';
import { parentalVerificationAllowsLearning } from '@/lib/legal-consent';
import { approvedTeacherFilter, teachesSubject } from '@/lib/teacher-shortlist';
import { publishIntroductionSchema } from '@/lib/introduction-booking';
import sendEmail from '@/lib/email';
import { createNotification } from '@/lib/notification-service';

const confirmationSchema = publishIntroductionSchema.pick({ meetingLink: true }).extend({ selectedRequestedStart: z.string().datetime() });

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]!));
}

export async function PATCH(req: Request, { params }: { params: { requestId: string } }) {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== 'admin') return NextResponse.json({ error: 'Admin account required' }, { status: 403 });
  const { requestId } = params;
  if (!mongoose.isValidObjectId(requestId)) return NextResponse.json({ error: 'Introduction request not found' }, { status: 404 });
  const parsed = confirmationSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Use an HTTPS Google Meet or Zoom meeting link' }, { status: 400 });

  await connectDB();
  const admin: any = await User.findOne({ _id: session.user.id, role: 'admin', isActive: true, emailVerified: true }).select('_id').lean();
  if (!admin) return NextResponse.json({ error: 'Active verified admin account required' }, { status: 403 });

  const request: any = await CoordinatedIntroductionRequest.findOne({ _id: requestId, status: 'requested' }).lean();
  if (!request) return NextResponse.json({ error: 'This introduction request is no longer awaiting confirmation' }, { status: 409 });
  const requestedSlots = request.requestedSlots?.length ? request.requestedSlots : [{ start: request.requestedStart, end: request.requestedEnd }];
  const selectedSlot = requestedSlots.find((slot: any) => new Date(slot.start).toISOString() === parsed.data.selectedRequestedStart);
  if (!selectedSlot) return NextResponse.json({ error: 'Choose one of the parent’s requested meeting times' }, { status: 400 });
  const parent: any = await User.findOne({ _id: request.parentId, role: 'parent', emailVerified: true })
    .select('name email role emailVerified isActive legalAcknowledgements safeguarding parentProfile.onboarding').lean();
  if (!parent || !parentalVerificationAllowsLearning(parent)) return NextResponse.json({ error: 'The parent account is not eligible for introduction confirmation' }, { status: 409 });

  const intake = parent.parentProfile?.onboarding;
  const onboarding = parentOnboardingSchema.safeParse(intake);
  const learner = onboarding.success ? onboarding.data.learners[request.learnerIndex] : undefined;
  const storedSubjectIndex = Number.isInteger(request.subjectIndex) ? request.subjectIndex : learner?.subjects.indexOf(request.subject);
  const subjectIndex = typeof storedSubjectIndex === 'number' ? storedSubjectIndex : -1;
  const key = `${request.learnerIndex}_${subjectIndex}`;
  const match = intake?.matches?.[key];
  if (!learner || learner.learnerId !== request.learnerId || learner.subjects[subjectIndex] !== request.subject || !match || String(match.coordinatedIntroduction?.requestId) !== String(request._id)) {
    return NextResponse.json({ error: 'The learning plan no longer matches this introduction request' }, { status: 409 });
  }

  const teachers: any[] = await User.find({ ...approvedTeacherFilter, _id: { $in: request.teacherIds } })
    .select('name email teacherProfile.subjects').lean();
  if (teachers.length !== request.teacherIds.length || teachers.some(teacher => !teachesSubject(teacher, request.subject))) {
    return NextResponse.json({ error: 'One or more shortlisted teachers are no longer eligible for this introduction' }, { status: 409 });
  }

  const confirmedAt = new Date();
  const matchPath = `parentProfile.onboarding.matches.${key}.coordinatedIntroduction`;
  const transaction = await mongoose.startSession();
  try {
    await transaction.withTransaction(async () => {
      const updatedRequest = await CoordinatedIntroductionRequest.updateOne({ _id: request._id, status: 'requested' }, { $set: {
        status: 'confirmed',
        confirmation: { meetingLink: parsed.data.meetingLink, start: selectedSlot.start, end: selectedSlot.end, confirmedBy: admin._id, confirmedAt },
      } }, { session: transaction });
      if (!updatedRequest.matchedCount) throw new Error('This introduction request has already been updated');
      const updatedPlan = await User.updateOne({
        _id: parent._id,
        role: 'parent',
        emailVerified: true,
        [`${matchPath}.requestId`]: String(request._id),
        [`${matchPath}.status`]: 'requested',
      }, { $set: {
        [`${matchPath}.status`]: 'confirmed',
        [`${matchPath}.meetingLink`]: parsed.data.meetingLink,
        [`${matchPath}.requestedStart`]: selectedSlot.start,
        [`${matchPath}.requestedEnd`]: selectedSlot.end,
        [`${matchPath}.confirmedAt`]: confirmedAt,
      } }, { session: transaction });
      if (!updatedPlan.matchedCount) throw new Error('The learning plan changed before confirmation');
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to confirm this introduction request' }, { status: 409 });
  } finally {
    await transaction.endSession();
  }

  const meetingTime = `${new Date(selectedSlot.start).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' })} UTC`;
  const notificationAdmins: any[] = await User.find({ role: 'admin', isActive: true, emailVerified: true }).select('_id email name').lean();
  const notifications = [
    {
      recipient: 'parent-confirmation',
      send: sendEmail({ to: parent.email, subject: `Introduction confirmed ${request.reference}`, template: 'coordinated-introduction-parent-confirmation', replacements: {
        parentName: escapeHtml(parent.name || 'Parent'), reference: escapeHtml(request.reference), subject: escapeHtml(request.subject),
        meetingTime: escapeHtml(meetingTime), meetingTimezone: escapeHtml(request.requestedTimezone), meetingLink: escapeHtml(parsed.data.meetingLink),
      } }),
    },
    ...teachers.map(teacher => ({
      recipient: `teacher-confirmation:${String(teacher._id)}`,
      send: sendEmail({ to: teacher.email, subject: `Introduction confirmed ${request.reference}`, template: 'coordinated-introduction-teacher-confirmation', replacements: {
        teacherName: escapeHtml(teacher.name || 'Teacher'), reference: escapeHtml(request.reference), subject: escapeHtml(request.subject),
        meetingTime: escapeHtml(meetingTime), meetingTimezone: escapeHtml(request.requestedTimezone), meetingLink: escapeHtml(parsed.data.meetingLink),
      } }),
    })),
    ...notificationAdmins.flatMap(notifyAdmin => [
      {
        recipient: `admin-confirmation:${String(notifyAdmin._id)}`,
        send: sendEmail({ to: notifyAdmin.email, subject: `Introduction confirmed ${request.reference}`, template: 'coordinated-introduction-admin-confirmation', replacements: {
          adminName: escapeHtml(notifyAdmin.name || 'Admin'), reference: escapeHtml(request.reference), subject: escapeHtml(request.subject),
          meetingTime: escapeHtml(meetingTime), meetingTimezone: escapeHtml(request.requestedTimezone), meetingLink: escapeHtml(parsed.data.meetingLink),
        } }),
      },
      {
        recipient: `admin-in-app:${String(notifyAdmin._id)}`,
        send: createNotification({ userId: String(notifyAdmin._id), type: 'introduction_request', title: 'Introduction confirmed', message: `${request.reference} has been confirmed for ${request.subject}.`, priority: 'high', data: { actionUrl: '/dashboard/admin/introduction-requests' } }),
      },
    ]),
    {
      recipient: 'parent-in-app',
      send: createNotification({ userId: String(parent._id), type: 'introduction_request', title: 'Introduction confirmed', message: `Your ${request.subject} introduction is confirmed. Open your Learning Plan for the meeting link.`, priority: 'high', data: { actionUrl: '/dashboard/learning-plan' } }),
    },
    ...teachers.map(teacher => ({
      recipient: `teacher-in-app:${String(teacher._id)}`,
      send: createNotification({ userId: String(teacher._id), type: 'introduction_request', title: 'Introduction confirmed', message: `Your ${request.subject} introduction has been confirmed. Workmate will host the meeting.`, priority: 'high', data: { actionUrl: '/dashboard/teacher' } }),
    })),
  ];
  const results = await Promise.allSettled(notifications.map(notification => notification.send));
  const failures = results.flatMap((result, index) => result.status === 'rejected' ? [notifications[index].recipient] : []);
  if (failures.length) {
    console.error(`Unable to send introduction confirmation notifications for ${request.reference}`, failures);
    await CoordinatedIntroductionRequest.updateOne({ _id: request._id }, { $set: { 'confirmationNotification.status': 'failed' }, $addToSet: { 'confirmationNotification.failures': { $each: failures } } });
  } else {
    await CoordinatedIntroductionRequest.updateOne({ _id: request._id }, { $set: { 'confirmationNotification.status': 'sent', 'confirmationNotification.sentAt': new Date() } });
  }

  return NextResponse.json({ success: true, reference: request.reference, status: 'confirmed' });
}
