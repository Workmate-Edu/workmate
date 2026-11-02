import { randomUUID } from 'crypto';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthSession } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/user';
import { notifyActiveAdmins } from '@/lib/admin-teacher-review-notifications';
import { CoordinatedIntroductionRequest } from '@/models/coordinated-introduction-request';
import { parentOnboardingSchema } from '@/lib/parent-onboarding';
import { approvedTeacherFilter, teachesSubject } from '@/lib/teacher-shortlist';
import { parentalVerificationAllowsLearning } from '@/lib/legal-consent';
import sendEmail from '@/lib/email';

const requestSchema = z.object({
  learner: z.number().int().min(0).max(9),
  subjectIndex: z.number().int().min(0).max(11),
  requestedStarts: z.array(z.string().datetime()).min(1).max(3).refine(values => new Set(values).size === values.length, 'Choose different times'),
  requestedTimezone: z.string().trim().min(1).max(80),
});

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]!));
}

function requestTimes(value: string) {
  const start = new Date(value);
  const milliseconds = start.getTime();
  if (!Number.isFinite(milliseconds) || milliseconds <= Date.now() || milliseconds > Date.now() + 90 * 86400000 || milliseconds % (15 * 60 * 1000) !== 0) {
    throw new Error('Choose a future 60-minute meeting time within the next 90 days');
  }
  return { start, end: new Date(milliseconds + 60 * 60 * 1000) };
}

export async function POST(req: Request) {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== 'parent') return NextResponse.json({ error: 'Parent account required' }, { status: 403 });
  const parsed = requestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Choose one to three valid requested meeting times' }, { status: 400 });

  let requestedSlots;
  try { requestedSlots = parsed.data.requestedStarts.map(requestTimes); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Choose a valid meeting time' }, { status: 400 }); }

  await connectDB();
  const parent: any = await User.findOne({ _id: session.user.id, role: 'parent', emailVerified: true })
    .select('name email role emailVerified isActive legalAcknowledgements safeguarding parentProfile.onboarding')
    .lean();
  if (!parent) return NextResponse.json({ error: 'Verified parent account required' }, { status: 403 });
  if (!parentalVerificationAllowsLearning(parent)) return NextResponse.json({ error: 'Parental verification is required before requesting introductions' }, { status: 403 });

  const intake = parent.parentProfile?.onboarding;
  const onboarding = parentOnboardingSchema.safeParse(intake);
  const learner = onboarding.success ? onboarding.data.learners[parsed.data.learner] : undefined;
  const subject = learner?.subjects[parsed.data.subjectIndex];
  const key = `${parsed.data.learner}_${parsed.data.subjectIndex}`;
  const match = intake?.matches?.[key];
  if (!learner?.learnerId || !subject || !match || match.subject !== subject) return NextResponse.json({ error: 'Shortlist a teacher before requesting an introduction' }, { status: 409 });
  if (match.selectedTeacherId || match.coordinatedIntroduction) return NextResponse.json({ error: 'An introduction request already exists for this learner and subject' }, { status: 409 });

  const teacherIds = match.teachers.map((teacher: any) => String(teacher.id));
  if (teacherIds.length < 1 || teacherIds.length > 3 || new Set(teacherIds).size !== teacherIds.length) return NextResponse.json({ error: 'Choose one to three teachers before requesting an introduction' }, { status: 409 });
  const teachers: any[] = await User.find({ ...approvedTeacherFilter, _id: { $in: teacherIds } }).select('name email teacherProfile.subjects').lean();
  if (teachers.length !== teacherIds.length || teachers.some(teacher => !teachesSubject(teacher, subject))) return NextResponse.json({ error: 'One or more shortlisted teachers are no longer available for this subject' }, { status: 409 });

  const reference = `CI-${randomUUID().slice(0, 8).toUpperCase()}`;
  const matchPath = `parentProfile.onboarding.matches.${key}`;
  const transaction = await mongoose.startSession();
  try {
    await transaction.withTransaction(async () => {
      const created = await CoordinatedIntroductionRequest.create([{
        reference,
        parentId: parent._id,
        learnerId: learner.learnerId,
        learnerIndex: parsed.data.learner,
        subjectIndex: parsed.data.subjectIndex,
        subject,
        teacherIds,
        requestedStart: requestedSlots[0].start,
        requestedEnd: requestedSlots[0].end,
        requestedSlots,
        requestedTimezone: parsed.data.requestedTimezone,
      }], { session: transaction });
      const updated = await User.updateOne({
        _id: parent._id,
        role: 'parent',
        emailVerified: true,
        [`${matchPath}.coordinatedIntroduction`]: { $exists: false },
        [`${matchPath}.selectedTeacherId`]: { $exists: false },
      }, { $set: {
        [`${matchPath}.coordinatedIntroduction`]: {
          requestId: String(created[0]._id),
          reference,
          status: 'requested',
          requestedStart: requestedSlots[0].start,
          requestedEnd: requestedSlots[0].end,
          requestedStarts: requestedSlots.map(slot => slot.start),
          requestedTimezone: parsed.data.requestedTimezone,
        },
      } }, { session: transaction });
      if (!updated.matchedCount) throw new Error('This learning plan changed. Refresh before requesting an introduction.');
    });
  } catch (error: any) {
    if (error?.code === 11000) return NextResponse.json({ error: 'An introduction request already exists for this learner and subject' }, { status: 409 });
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to save your introduction request' }, { status: 409 });
  } finally {
    await transaction.endSession();
  }

  try {
    await notifyActiveAdmins({
      type: 'introduction_request',
      title: 'Introduction request received',
      message: `${parent.name || 'A parent'} requested a ${subject} introduction.`,
      data: { actionUrl: '/dashboard/admin/introduction-requests' },
    });
    const admins: any[] = await User.find({ role: 'admin', isActive: true, emailVerified: true })
      .select('email')
      .lean();
    if (!admins.length) throw new Error('No active verified admin recipients');
    const requestedTime = requestedSlots.map(slot => `${slot.start.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' })} UTC`).join('; ');
    const replacements = {
      reference: escapeHtml(reference),
      parentName: escapeHtml(parent.name || 'Parent'),
      parentEmail: escapeHtml(parent.email || ''),
      subject: escapeHtml(subject),
      teacherNames: escapeHtml(teachers.map(teacher => teacher.name).join(', ')),
      requestedTime: escapeHtml(requestedTime),
      requestedTimezone: escapeHtml(parsed.data.requestedTimezone),
    };
    await Promise.all(admins.map(admin => sendEmail({
      to: admin.email,
      subject: `Coordinated introduction request ${reference}`,
      template: 'coordinated-introduction-request',
      replacements,
    })));
    await CoordinatedIntroductionRequest.updateOne({ reference }, { $set: { 'notification.status': 'sent', 'notification.sentAt': new Date() } });
  } catch (error) {
    console.error(`Unable to send coordinated introduction notification for ${reference}`, error);
    await CoordinatedIntroductionRequest.updateOne({ reference }, { $set: { 'notification.status': 'failed' } });
  }

  const requestedTime = requestedSlots.map(slot => `${slot.start.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' })} UTC`).join('; ');
  const recipientNotifications = [
    {
      recipient: 'parent-acknowledgement',
      send: sendEmail({
        to: parent.email,
        subject: `Introduction request received ${reference}`,
        template: 'coordinated-introduction-parent-request',
        replacements: {
          parentName: escapeHtml(parent.name || 'Parent'),
          reference: escapeHtml(reference),
          subject: escapeHtml(subject),
          requestedTime: escapeHtml(requestedTime),
          requestedTimezone: escapeHtml(parsed.data.requestedTimezone),
        },
      }),
    },
    ...teachers.map(teacher => ({
      recipient: `teacher:${String(teacher._id)}`,
      send: sendEmail({
        to: teacher.email,
        subject: `Coordinated introduction requested ${reference}`,
        template: 'coordinated-introduction-teacher-request',
        replacements: {
          teacherName: escapeHtml(teacher.name || 'Teacher'),
          reference: escapeHtml(reference),
          subject: escapeHtml(subject),
          requestedTime: escapeHtml(requestedTime),
          requestedTimezone: escapeHtml(parsed.data.requestedTimezone),
        },
      }),
    })),
  ];
  const notificationResults = await Promise.allSettled(recipientNotifications.map(notification => notification.send));
  const failedRecipients = notificationResults.flatMap((result, index) => result.status === 'rejected' ? [recipientNotifications[index].recipient] : []);
  if (failedRecipients.length) {
    console.error(`Unable to send coordinated introduction recipient notifications for ${reference}`, failedRecipients);
    await CoordinatedIntroductionRequest.updateOne({ reference }, {
      $set: { 'notification.status': 'failed' },
      $addToSet: { 'notification.failures': { $each: failedRecipients } },
    });
  }

  return NextResponse.json({ success: true, reference, status: 'requested' }, { status: 201 });
}
