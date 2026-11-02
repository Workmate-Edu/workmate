import { z } from 'zod';
import { recordBookingNotifications } from '@/lib/booking-notifications';
import { IntroductionSlot } from '@/models/introduction-slot';
import { User } from '@/models/user';
import { intakePath } from '@/lib/learning-workflow';
import { approvedTeacherFilter, teachesSubject } from '@/lib/teacher-shortlist';
import { overlaps } from '@/lib/introduction-booking';
import { scheduleTransaction, assertScheduleAvailable, SchedulingError } from '@/lib/scheduling';
const schema = z.object({ action: z.enum(['cancel', 'reschedule', 'withdraw']), slotId: z.string().min(1).max(100), replacementSlotId: z.string().min(1).max(100).optional() });
export async function changeIntroductionBooking(actor: { id: string; role: string }, input: unknown) {
  const parsed = schema.safeParse(input);
  if (!parsed.success) throw new SchedulingError('Check your booking details');
  const { action, slotId, replacementSlotId } = parsed.data;
  const lookup: any = await IntroductionSlot.findById(slotId).select('teacherId').lean();
  if (!lookup) throw new SchedulingError('Booking not found');
  const teacherId = String(lookup.teacherId);
  await scheduleTransaction(teacherId, async transaction => {
    const slot: any = await IntroductionSlot.findById(slotId).session(transaction).lean();
    const isTeacher = actor.role === 'teacher' && actor.id === teacherId;
    const isOwner = actor.id === String(slot.ownerId) && actor.role === slot.ownerRole;
    if (actor.role !== 'admin' && !isTeacher && !isOwner) throw new SchedulingError('You cannot change this booking');
    if (slot.startTime <= new Date()) throw new SchedulingError('Only future bookings can be changed');
    const audit = { action, by: actor.id, at: new Date(), replacementSlotId };
    if (action === 'withdraw') {
      if ((!isTeacher && actor.role !== 'admin') || slot.status !== 'available') throw new SchedulingError('Only an available slot can be withdrawn');
      await IntroductionSlot.updateOne({ _id: slotId }, { $set: { status: 'cancelled' }, $push: { history: audit } }, { session: transaction });
      return;
    }
    if (slot.status !== 'booked') throw new SchedulingError('Only a booked slot can be changed');
    const path = intakePath(slot.ownerRole);
    const owner: any = await User.findById(slot.ownerId).select(path).session(transaction).lean();
    const intake = slot.ownerRole === 'parent' ? owner?.parentProfile?.onboarding : owner?.studentProfile?.onboarding;
    const match = intake?.matches?.[slot.matchKey];
    const isFreeLesson = slot.kind === 'free-lesson';
    if (!match || (!isFreeLesson && (match.selectedTeacherId || match.completedIntroductions.includes(teacherId)))) throw new SchedulingError('This introduction can no longer be changed');
    const bookingPath = isFreeLesson ? `${path}.matches.${slot.matchKey}.freeLesson` : `${path}.matches.${slot.matchKey}.bookings.${teacherId}`;
    let replacement: any;
    if (action === 'reschedule') {
      if (!replacementSlotId || replacementSlotId === slotId) throw new SchedulingError('Choose a different time');
      replacement = await IntroductionSlot.findOne({ _id: replacementSlotId, teacherId, kind: isFreeLesson ? 'free-lesson' : { $ne: 'free-lesson' }, status: 'available', startTime: { $gt: new Date() } }).session(transaction).lean();
      if (!replacement) throw new SchedulingError('The replacement time is no longer available');
      const teacher = await User.findOne({ ...approvedTeacherFilter, _id: teacherId }).select('teacherProfile.subjects').session(transaction).lean();
      if (!teacher || !teachesSubject(teacher, match.subject)) throw new SchedulingError('Teacher is no longer available');
      for (const [key, entry] of Object.entries(intake.matches) as Array<[string, any]>) {
        if (!key.startsWith(`${slot.learner}_`)) continue;
        if ([...Object.values(entry.bookings || {}), ...(entry.freeLesson ? [entry.freeLesson] : [])].some((booking: any) => booking.slotId !== slotId && overlaps(booking, replacement))) throw new SchedulingError('This learner already has a booking at that time');
      }
      await assertScheduleAvailable(teacherId, [replacement], transaction, { slotId: replacementSlotId });
      await IntroductionSlot.updateOne({ _id: replacementSlotId, status: 'available' }, { $set: { status: 'booked', ownerId: slot.ownerId, ownerRole: slot.ownerRole, learner: slot.learner, learnerName: slot.learnerName, matchKey: slot.matchKey, subject: slot.subject, ...(isFreeLesson ? { freeClaimKey: slot.freeClaimKey } : {}), bookedBy: actor.id, bookedAt: new Date() }, $push: { history: audit } }, { session: transaction });
    }
    const result = await User.updateOne({ _id: slot.ownerId, [`${bookingPath}.slotId`]: slotId }, {
      ...(replacement ? { $set: { [bookingPath]: { slotId: replacement._id, startTime: replacement.startTime, endTime: replacement.endTime, meetingLink: replacement.meetingLink }, ...(isFreeLesson ? { ['freeLessonClaims.' + slot.freeClaimKey + '.slotId']: replacement._id } : {}) } } : { $unset: { [bookingPath]: '', ...(isFreeLesson ? { ['freeLessonClaims.' + slot.freeClaimKey]: '' } : {}) } }),
      $push: { [`${path}.bookingHistory`]: { ...audit, slotId, teacherId, matchKey: slot.matchKey } },
    }, { session: transaction });
    if (!result.matchedCount) throw new SchedulingError('Booking changed. Refresh and try again');
    await recordBookingNotifications({ ...slot, startTime: replacement?.startTime || slot.startTime }, replacement ? 'rescheduled' : 'cancelled', transaction);
    await IntroductionSlot.updateOne({ _id: slotId }, { $set: { status: isTeacher ? 'cancelled' : 'available' }, $unset: { ownerId: '', ownerRole: '', learner: '', learnerName: '', matchKey: '', subject: '', bookedBy: '', bookedAt: '', freeClaimKey: '' }, $push: { history: { ...audit, ownerId: slot.ownerId, learner: slot.learner } } }, { session: transaction });
  });
}
