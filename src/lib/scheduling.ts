import mongoose, { type ClientSession } from 'mongoose';
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';
import { User } from '@/models/user';
import { IntroductionSlot } from '@/models/introduction-slot';
import { TeachingSession } from '@/models/teaching-session';
import { Session } from '@/models/session';
import { Schedule, TeacherSchedule } from '@/models/schedule';

export class SchedulingError extends Error {}
type Interval = { startTime: Date; endTime: Date };
export function recurrenceEnd(value: string, timezone: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? fromZonedTime(`${value}T23:59:59.999`, timezone) : new Date(value);
}
export function sessionOccurrences(record: any, window?: Interval): Interval[] {
  const start = new Date(record.startTime), end = new Date(record.endTime);
  const duration = end.getTime() - start.getTime();
  if (!Number.isFinite(duration) || duration <= 0 || duration > 24 * 3600000) throw new SchedulingError('Invalid session duration');
  const recurrence = record.recurrence;
  if (!recurrence?.isRecurring) return [{ startTime: start, endTime: end }];
  const timezone = record.timezone || 'UTC';
  const final = new Date(recurrence.endDate);
  if (!Number.isFinite(final.getTime()) || final < start || final.getTime() - start.getTime() > 366 * 86400000) throw new SchedulingError('Recurring schedules need an end date within one year');
  const pattern = recurrence.pattern;
  if (!['daily', 'weekly', 'multiple-days', 'bi-weekly'].includes(pattern)) throw new SchedulingError('Unsupported recurrence pattern');
  const firstDay = formatInTimeZone(start, timezone, 'yyyy-MM-dd');
  // Older date-only end dates were stored at UTC midnight. Include that whole calendar day.
  const lastDay = final.toISOString().endsWith('T00:00:00.000Z') ? final.toISOString().slice(0, 10) : formatInTimeZone(final, timezone, 'yyyy-MM-dd');
  const clock = formatInTimeZone(start, timezone, 'HH:mm:ss.SSS');
  const weekday = new Date(firstDay + 'T00:00:00Z').getUTCDay();
  const days: number[] = recurrence.daysOfWeek?.length ? recurrence.daysOfWeek : [weekday];
  if (days.some(day => !Number.isInteger(day) || day < 0 || day > 6)) throw new SchedulingError('Invalid recurring days');
  const result: Interval[] = [];
  for (let offset = 0; offset <= 366; offset++) {
    const day = new Date(new Date(firstDay + 'T00:00:00Z').getTime() + offset * 86400000);
    const date = day.toISOString().slice(0, 10);
    if (date > lastDay) break;
    const occurs = offset === 0 || pattern === 'daily' || (pattern === 'bi-weekly' ? offset % 14 === 0 : days.includes(day.getUTCDay()));
    if (!occurs) continue;
    const occurrenceStart = offset === 0 ? start : fromZonedTime(`${date}T${clock}`, timezone);
    // Do not silently shift nonexistent wall times during spring DST transitions.
    if (formatInTimeZone(occurrenceStart, timezone, 'yyyy-MM-dd HH:mm:ss.SSS') !== `${date} ${clock}`) throw new SchedulingError('A recurring time does not exist in this timezone; choose a different time');
    const occurrenceEnd = new Date(occurrenceStart.getTime() + duration);
    if (!window || (occurrenceStart < window.endTime && occurrenceEnd > window.startTime)) result.push({ startTime: occurrenceStart, endTime: occurrenceEnd });
  }
  return result;
}
export async function scheduleTransaction<T>(teacherId: string, work: (transaction: ClientSession) => Promise<T>): Promise<T> {
  const transaction = await mongoose.startSession();
  try {
    let result!: T;
    await transaction.withTransaction(async () => {
      // Every schedule writer touches this existing teacher document BEFORE reading schedules.
      // Concurrent writers then retry with a fresh snapshot, including legacy schedule writers.
      const locked = await User.updateOne({ _id: teacherId, role: 'teacher' }, { $inc: { schedulingRevision: 1 } }, { session: transaction });
      if (!locked.matchedCount) throw new SchedulingError('Teacher not found');
      result = await work(transaction);
    });
    return result;
  } finally { await transaction.endSession(); }
}
export async function assertScheduleAvailable(teacherId: string, intervals: Interval[], transaction: ClientSession, exclude: { slotId?: string; teachingId?: string } = {}) {
  for (const interval of intervals) {
    const range = { teacherId, status: { $nin: ['cancelled', 'completed'] }, startTime: { $lt: interval.endTime }, endTime: { $gt: interval.startTime } };
    const slots = await IntroductionSlot.exists({ ...range, ...(exclude.slotId ? { _id: { $ne: exclude.slotId } } : {}) }).session(transaction);
    if (slots) throw new SchedulingError('This time overlaps a published introduction or free-lesson slot');
    const legacy = await TeachingSession.find({ teacherId, status: { $nin: ['cancelled', 'completed'] }, ...(exclude.teachingId ? { _id: { $ne: exclude.teachingId } } : {}),
      $or: [{ startTime: { $lt: interval.endTime }, endTime: { $gt: interval.startTime } }, { 'recurrence.isRecurring': true, startTime: { $lt: interval.endTime }, $or: [{ 'recurrence.endDate': { $gte: new Date(interval.startTime.getTime() - 86400000) } }, { 'recurrence.endDate': { $exists: false } }] }] }).session(transaction).lean();
    if (legacy.some(record => sessionOccurrences(record, interval).some(item => item.startTime < interval.endTime && item.endTime > interval.startTime))) throw new SchedulingError('This time overlaps an existing lesson');
    const direct = await TeacherSchedule.exists(range).session(transaction);
    const unmigratedRecurring = await Session.exists({ teacherId, status: range.status, 'schedule.isRecurring': true, 'schedule.startTime': { $lt: interval.endTime } }).session(transaction);
    if (unmigratedRecurring) throw new SchedulingError('An older recurring schedule needs review before booking this time');
    const older = await Session.exists({ teacherId, status: range.status, 'schedule.startTime': { $lt: interval.endTime }, 'schedule.endTime': { $gt: interval.startTime } }).session(transaction);
    const simple = await Schedule.exists({ teacherId, status: range.status, startTime: { $lt: interval.endTime }, $expr: { $gt: [{ $add: ['$startTime', { $multiply: ['$duration', 60000] }] }, interval.startTime] } }).session(transaction);
    if (direct || older || simple) throw new SchedulingError('This time overlaps an existing lesson');
  }
}
