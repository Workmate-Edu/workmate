import { freeLessonClaimKey, canClaimFreeLesson } from '@/lib/free-lesson-policy';
import { recordBookingNotifications } from '@/lib/booking-notifications';
import { scheduleTransaction, assertScheduleAvailable, SchedulingError } from '@/lib/scheduling';
import { changeIntroductionBooking } from '@/lib/change-introduction-booking';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthSession } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/user';
import { IntroductionSlot } from '@/models/introduction-slot';
import { approvedTeacherFilter, teachesSubject } from '@/lib/teacher-shortlist';
import { intakePath } from '@/lib/learning-workflow';
import { introductionTimes, overlaps, publishIntroductionSchema } from '@/lib/introduction-booking';
import { hasCurrentTeacherConductAcknowledgement, parentalVerificationAllowsLearning } from '@/lib/legal-consent';
const objectId = z.string().regex(/^[a-f\d]{24}$/i);
const bookingSchema = z.object({ slotId: z.string().max(100), ownerId: objectId, role: z.enum(['parent', 'student']), learner: z.number().int().min(0).max(9), subjectIndex: z.number().int().min(0).max(11) });

export async function GET(req: Request) {
  const session = await getAuthSession();
  if (!session?.user) return NextResponse.json({ error: 'Please sign in' }, { status: 401 });
  await connectDB();
  if (session.user.role === 'teacher') {
    const slots = await IntroductionSlot.find({ teacherId: session.user.id, endTime: { $gt: new Date(Date.now() - 7 * 86400000) } }).sort({ startTime: 1 }).lean();
    return NextResponse.json({ slots });
  }
  if (!['admin', 'parent', 'student'].includes(session.user.role)) return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  if (session.user.role === 'parent') {
    const current = await User.findById(session.user.id).select('role emailVerified isActive legalAcknowledgements safeguarding').lean();
    if (!parentalVerificationAllowsLearning(current)) return NextResponse.json({ error: 'Parental verification is required before viewing teacher availability' }, { status: 403 });
  }
  const teacherId = objectId.safeParse(new URL(req.url).searchParams.get('teacherId'));
  if (!teacherId.success) return NextResponse.json({ error: 'Choose a teacher' }, { status: 400 });
  const kind = new URL(req.url).searchParams.get('kind') === 'free-lesson' ? 'free-lesson' : 'introduction';
  const slots = await IntroductionSlot.find({ teacherId: teacherId.data, kind: kind === 'free-lesson' ? 'free-lesson' : { $ne: 'free-lesson' }, status: 'available', startTime: { $gt: new Date() } }).select('_id startTime endTime').sort({ startTime: 1 }).lean();
  return NextResponse.json({ slots });
}

export async function POST(req: Request) {
  const session = await getAuthSession();
  if (!session?.user) return NextResponse.json({ error: 'Please sign in' }, { status: 401 });
  try {
    const body = await req.json();
    await connectDB();
    if (session.user.role === 'teacher') {
      const parsed = publishIntroductionSchema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: 'Check the start time and meeting link' }, { status: 400 });
      const teacher: any = await User.findOne({ ...approvedTeacherFilter, _id: session.user.id }).select('legalAcknowledgements').lean();
      if (!teacher) return NextResponse.json({ error: 'An active verified teacher account is required' }, { status: 403 });
      if (!hasCurrentTeacherConductAcknowledgement(teacher)) return NextResponse.json({ error: 'Acknowledge the current teacher conduct and meeting rules before publishing slots' }, { status: 403 });
      const times = introductionTimes(parsed.data.startTime, Date.now(), parsed.data.kind);
      await scheduleTransaction(session.user.id, async transaction => {
        await assertScheduleAvailable(session.user.id, [times], transaction);
        await IntroductionSlot.create([{ _id: `${session.user.id}_${times.startTime.getTime()}`, teacherId: session.user.id, ...times, kind: parsed.data.kind, meetingLink: parsed.data.meetingLink }], { session: transaction });
      });
      return NextResponse.json({ success: true });
    }
    const parsed = bookingSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Check the booking details' }, { status: 400 });
    const data = parsed.data;
    if (session.user.role !== 'admin' && (session.user.id !== data.ownerId || session.user.role !== data.role)) return NextResponse.json({ error: 'You can only book for your own account' }, { status: 403 });
    const lookup: any = await IntroductionSlot.findOne({ _id: data.slotId }).select('teacherId').lean();
    if (!lookup) throw new Error('This introduction is no longer available');
    await scheduleTransaction(String(lookup.teacherId), async transaction => {
        const path = intakePath(data.role);
        const owner: any = await User.findOne({ _id: data.ownerId, role: data.role, emailVerified: true }).select(path + ' role emailVerified isActive legalAcknowledgements safeguarding freeLessonClaims freeLessonEligible subscription').session(transaction).lean();
        const intake = data.role === 'parent' ? owner?.parentProfile?.onboarding : owner?.studentProfile?.onboarding;
        if (!parentalVerificationAllowsLearning(owner)) throw new SchedulingError('Parental verification is required before booking');
        const key = `${data.learner}_${data.subjectIndex}`;
        const match = intake?.matches?.[key];
        const slot: any = await IntroductionSlot.findOne({ _id: data.slotId, status: 'available', startTime: { $gt: new Date() } }).session(transaction).lean();
        if (!slot || !match) throw new Error('This introduction is no longer available');
        const teacherId = String(slot.teacherId);
        const isFreeLesson = slot.kind === 'free-lesson';
        let claimKey: string | undefined;
        if (isFreeLesson) {
          if (match.selectedTeacherId !== teacherId || !match.completedIntroductions.includes(teacherId)) throw new SchedulingError('Choose your teacher after the introductions before booking the free lesson');
          claimKey = freeLessonClaimKey(data.role, data.learner, match.subject);
          canClaimFreeLesson(owner, claimKey);
        } else if (data.role === 'parent') {
          throw new SchedulingError('Request one coordinated introduction from your learning plan');
        } else if (match.selectedTeacherId || !match.teachers.some((teacher: any) => teacher.id === teacherId) || match.bookings?.[teacherId] || match.completedIntroductions.includes(teacherId)) throw new Error('Choose an unbooked teacher from your introduction choices');
        const teacher = await User.findOne({ ...approvedTeacherFilter, _id: teacherId }).select('teacherProfile.subjects').session(transaction).lean();
        if (!teacher || !teachesSubject(teacher, match.subject)) throw new Error('Teacher is no longer available for this subject');
        for (const [matchKey, item] of Object.entries(intake.matches) as Array<[string, any]>) {
          if (!matchKey.startsWith(`${data.learner}_`)) continue;
          if ([...Object.values(item.bookings || {}), ...(item.freeLesson ? [item.freeLesson] : [])].some((booking: any) => overlaps(booking, slot))) throw new Error('This learner already has an introduction at that time');
        }
        await assertScheduleAvailable(teacherId, [slot], transaction, { slotId: data.slotId });
        const booked = await IntroductionSlot.updateOne({ _id: data.slotId, status: 'available' }, { $set: { status: 'booked', ownerId: data.ownerId, ownerRole: data.role, learner: data.learner, matchKey: key, learnerName: intake.learners[data.learner].name, subject: match.subject, bookedBy: session.user.id, bookedAt: new Date(), ...(claimKey ? { freeClaimKey: claimKey } : {}) } }, { session: transaction });
        if (!booked.matchedCount) throw new Error('This time was just booked. Choose another slot');
        const bookingPath = isFreeLesson ? path + '.matches.' + key + '.freeLesson' : path + '.matches.' + key + '.bookings.' + teacherId;
        const saved = await User.updateOne({ _id: data.ownerId, [bookingPath]: { $exists: false }, ...(claimKey ? { ['freeLessonClaims.' + claimKey]: { $exists: false } } : {}) }, { $set: {
          [bookingPath]: { slotId: data.slotId, startTime: slot.startTime, endTime: slot.endTime, meetingLink: slot.meetingLink },
          ...(claimKey ? { freeLessonEligible: true, ['freeLessonClaims.' + claimKey]: { slotId: data.slotId, learner: data.learner, subject: match.subject, reservedAt: new Date() } } : {}),
        } }, { session: transaction });
        if (!saved.matchedCount) throw new Error('This introduction has already been booked');
        await recordBookingNotifications({ ...slot, ownerId: data.ownerId, learnerName: intake.learners[data.learner].name, subject: match.subject }, 'booked', transaction);
      });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error instanceof SchedulingError) return NextResponse.json({ error: error.message }, { status: 409 });
    if (error?.code === 11000) return NextResponse.json({ error: 'That slot already exists' }, { status: 409 });
    const expected = ['Choose a future', 'This introduction', 'Choose an unbooked', 'Teacher is no longer', 'This learner', 'This time'];
    if (expected.some(prefix => error?.message?.startsWith(prefix))) return NextResponse.json({ error: error.message }, { status: 409 });
    return NextResponse.json({ error: 'Booking could not be saved. Please try again or contact the team.' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getAuthSession();
  if (!session?.user) return NextResponse.json({ error: 'Please sign in' }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (typeof body?.slotId !== 'string') return NextResponse.json({ error: 'Choose a booking' }, { status: 400 });
  await connectDB();
  if (['cancel', 'reschedule', 'withdraw'].includes(body.action)) {
    try { await changeIntroductionBooking(session.user, body); return NextResponse.json({ success: true }); }
    catch (error) { return NextResponse.json({ error: error instanceof SchedulingError ? error.message : 'Unable to change booking' }, { status: error instanceof SchedulingError ? 409 : 500 }); }
  }
  if (!['admin', 'teacher'].includes(session.user.role)) return NextResponse.json({ error: 'Teacher or admin access required' }, { status: 403 });
  const lookup: any = await IntroductionSlot.findOne({ _id: body.slotId }).select('teacherId').lean();
  if (!lookup) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  try {
    await scheduleTransaction(String(lookup.teacherId), async transaction => {
      const slot: any = await IntroductionSlot.findOne({ _id: body.slotId, status: 'booked', endTime: { $lte: new Date() }, ...(session.user.role === 'teacher' ? { teacherId: session.user.id } : {}) }).session(transaction).lean();
      if (!slot) throw new Error('Booking is unavailable or has not ended');
      const path = intakePath(slot.ownerRole);
      const teacherId = String(slot.teacherId);
      const isFreeLesson = slot.kind === 'free-lesson';
      const bookingPath = isFreeLesson ? path + '.matches.' + slot.matchKey + '.freeLesson' : path + '.matches.' + slot.matchKey + '.bookings.' + teacherId;
      const updated = await User.updateOne({ _id: slot.ownerId, [bookingPath + '.slotId']: slot._id }, isFreeLesson ? { $set: {
        [bookingPath + '.completed']: true, ['freeLessonClaims.' + slot.freeClaimKey + '.completedAt']: new Date(),
      } } : { $addToSet: { [path + '.matches.' + slot.matchKey + '.completedIntroductions']: teacherId }, $set: { [path + '.matches.' + slot.matchKey + '.introductionRecords.' + teacherId]: { recordedBy: session.user.id, recordedAt: new Date(), durationMinutes: 15 } } }, { session: transaction });
      if (!updated.matchedCount) throw new Error('Learning request has changed');
      await IntroductionSlot.updateOne({ _id: slot._id, status: 'booked' }, { $set: { status: 'completed', completedBy: session.user.id, completedAt: new Date() } }, { session: transaction });
      await recordBookingNotifications(slot, 'completed', transaction);
    });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: 'Only an ended, booked introduction can be completed. Refresh and try again.' }, { status: 409 }); }

}
