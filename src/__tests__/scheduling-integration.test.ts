jest.mock('@/lib/auth', () => ({ getAuthSession: jest.fn() }));
jest.mock('@/lib/mongodb', () => ({ connectDB: jest.fn() }));
jest.mock('next-auth', () => ({ getServerSession: jest.fn() }));
jest.mock('@/lib/sendSmtpMail', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/lib/notification-service', () => ({ sendSessionNotification: jest.fn() }));
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { getAuthSession } from '@/lib/auth';
import { User } from '@/models/user';
import { IntroductionSlot } from '@/models/introduction-slot';
import { Notification } from '@/models/notification';
import { TeachingSession } from '@/models/teaching-session';
import { TeacherSchedule, Schedule } from '@/models/schedule';
import { Session } from '@/models/session';
import { scheduleTransaction, assertScheduleAvailable, sessionOccurrences } from '@/lib/scheduling';
import { POST, PATCH } from '@/app/api/introductions/route';
import { POST as createLegacySession } from '@/app/api/teacher/sessions/route';
import { PUT as updateLegacySession } from '@/app/api/teacher/sessions/[id]/update/route';
import { getServerSession } from 'next-auth';
jest.setTimeout(120000);
let replica: MongoMemoryReplSet;
const teacher = new mongoose.Types.ObjectId(), owner = new mongoose.Types.ObjectId(), other = new mongoose.Types.ObjectId();
const start = new Date(Math.ceil((Date.now() + 86400000) / 900000) * 900000);
const interval = { startTime: start, endTime: new Date(start.getTime() + 900000) };
const req = (body: unknown) => new Request('http://localhost/api/introductions', { method: 'POST', body: JSON.stringify(body) });
const target = { slotId: 'slot', ownerId: String(owner), role: 'parent', learner: 0, subjectIndex: 0 };
const makeIntake = () => ({ status: 'contacting', learners: [{ name: 'Test learner' }], matches: { '0_0': { subject: 'Yoruba', teachers: [{ id: String(teacher), name: 'Test teacher' }], completedIntroductions: [] } } });
beforeAll(async () => {
  replica = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const uri = replica.getUri('workmate_booking_tests');
  if (!uri.includes('127.0.0.1')) throw new Error('Tests must use an isolated local database');
  await mongoose.connect(uri);
  await Promise.all([User.init(), IntroductionSlot.init(), TeachingSession.init(), TeacherSchedule.init(), Schedule.init(), Session.init(), Notification.init()]);
});
afterAll(async () => { await mongoose.disconnect(); if (replica) await replica.stop(); });
beforeEach(async () => {
  await Promise.all([User.deleteMany({}), IntroductionSlot.deleteMany({}), TeachingSession.deleteMany({}), Notification.deleteMany({})]);
  await User.collection.insertMany([
    { _id: teacher, email: 'teacher@example.invalid', username: 'test_teacher', role: 'teacher', name: 'Test teacher', isActive: true, teacherProfile: { verificationStatus: 'verified', subjects: [{ area: 'languages', subjects: ['yoruba'] }] } },
    { _id: owner, email: 'owner@example.invalid', username: 'test_owner', role: 'parent', name: 'Test owner', emailVerified: true, parentProfile: { onboarding: makeIntake() } },
    { _id: other, email: 'other@example.invalid', username: 'test_other', role: 'parent', name: 'Other owner', emailVerified: true, parentProfile: { onboarding: makeIntake() } },
  ]);
  await IntroductionSlot.create({ _id: 'slot', teacherId: teacher, ...interval, meetingLink: 'https://example.com/test-room' });
  (getAuthSession as jest.Mock).mockResolvedValue({ user: { id: 'internal-admin', role: 'admin' } });
  (getServerSession as jest.Mock).mockResolvedValue({ user: { id: String(teacher), role: 'teacher' } });
});
it('allows exactly one of two simultaneous bookings for a slot', async () => {
  const responses = await Promise.all([POST(req(target)), POST(req({ ...target, ownerId: String(other) }))]);
  expect(responses.map(r => r.status).sort()).toEqual([200, 409]);
  expect(await IntroductionSlot.countDocuments({ status: 'booked' })).toBe(1);
  expect(await User.countDocuments({ 'parentProfile.onboarding.matches.0_0.bookings': { $exists: true } })).toBe(1);
  expect(await Notification.countDocuments({ type: 'session_created' })).toBe(2);
});
it('cancels atomically and permits booking a new introduction without granting extra teachers', async () => {
  expect((await POST(req(target))).status).toBe(200);
  expect((await PATCH(req({ slotId: 'slot', action: 'cancel' }))).status).toBe(200);
  expect((await IntroductionSlot.findById('slot').lean<any>())?.status).toBe('available');
  const account: any = await User.findById(owner).lean();
  expect(account.parentProfile.onboarding.matches['0_0'].bookings?.[String(teacher)]).toBeUndefined();
  expect((await POST(req(target))).status).toBe(200);
});
it('keeps the original reservation if a reschedule target is unavailable', async () => {
  await POST(req(target));
  expect((await PATCH(req({ slotId: 'slot', action: 'reschedule', replacementSlotId: 'missing' }))).status).toBe(409);
  expect((await IntroductionSlot.findById('slot').lean<any>())?.status).toBe('booked');
  expect(await Notification.countDocuments({ type: 'session_updated' })).toBe(0);
});
it('moves the reservation and learner record together', async () => {
  await POST(req(target));
  await IntroductionSlot.create({ _id: 'replacement', teacherId: teacher, startTime: interval.endTime, endTime: new Date(interval.endTime.getTime() + 900000), meetingLink: 'https://example.com/new-room' });
  expect((await PATCH(req({ slotId: 'slot', action: 'reschedule', replacementSlotId: 'replacement' }))).status).toBe(200);
  expect((await IntroductionSlot.findById('slot').lean<any>())?.status).toBe('available');
  const account: any = await User.findById(owner).lean();
  expect(account.parentProfile.onboarding.matches['0_0'].bookings[String(teacher)].slotId).toBe('replacement');
});
it('serializes a legacy session writer against a slot publisher', async () => {
  await IntroductionSlot.deleteMany({});
  const results = await Promise.allSettled([
    scheduleTransaction(String(teacher), async transaction => {
      await assertScheduleAvailable(String(teacher), [interval], transaction);
      await IntroductionSlot.create([{ _id: 'new-slot', teacherId: teacher, ...interval, meetingLink: 'https://example.com/room' }], { session: transaction });
    }),
    scheduleTransaction(String(teacher), async transaction => {
      await assertScheduleAvailable(String(teacher), [interval], transaction);
      await TeachingSession.create([{ teacherId: teacher, studentId: owner, subject: { name: 'yoruba', area: 'languages' }, timezone: 'UTC', ...interval, duration: 15, meetingLink: 'https://example.com/lesson' }], { session: transaction });
    }),
  ]);
  expect(results.filter(r => r.status === 'fulfilled')).toHaveLength(1);
  expect((await IntroductionSlot.countDocuments()) + (await TeachingSession.countDocuments())).toBe(1);
});
it('detects a later recurring occurrence instead of only the first lesson', async () => {
  await IntroductionSlot.deleteMany({});
  const earlier = new Date(start.getTime() - 7 * 86400000);
  await TeachingSession.create({ teacherId: teacher, studentId: owner, subject: { name: 'yoruba', area: 'languages' }, timezone: 'UTC', startTime: earlier, endTime: new Date(earlier.getTime() + 900000), duration: 15, meetingLink: 'https://example.com/recurring', recurrence: { isRecurring: true, pattern: 'weekly', endDate: start } });
  await expect(scheduleTransaction(String(teacher), transaction => assertScheduleAvailable(String(teacher), [interval], transaction))).rejects.toThrow('overlaps');
});
it('preserves local clock time when a recurring lesson crosses DST', () => {
  const occurrences = sessionOccurrences({ startTime: '2026-10-25T14:00:00Z', endTime: '2026-10-25T15:00:00Z', timezone: 'America/New_York', recurrence: { isRecurring: true, pattern: 'weekly', endDate: '2026-11-08T15:00:00Z' } });
  expect(occurrences.map(item => item.startTime.toISOString())).toEqual(['2026-10-25T14:00:00.000Z', '2026-11-01T15:00:00.000Z', '2026-11-08T15:00:00.000Z']);
});
it('rejects cancellation by a different parent without releasing the slot', async () => {
  await POST(req(target));
  (getAuthSession as jest.Mock).mockResolvedValue({ user: { id: String(other), role: 'parent' } });
  expect((await PATCH(req({ slotId: 'slot', action: 'cancel' }))).status).toBe(409);
  expect((await IntroductionSlot.findById('slot').lean<any>())?.status).toBe('booked');
});
it('protects one learner from concurrent bookings with different teachers', async () => {
  const secondTeacher = new mongoose.Types.ObjectId();
  await User.collection.insertOne({ _id: secondTeacher, email: 'second@example.invalid', username: 'test_second', role: 'teacher', isActive: true, teacherProfile: { verificationStatus: 'verified', subjects: [{ subjects: ['yoruba'] }] } });
  await User.updateOne({ _id: owner }, { $push: { 'parentProfile.onboarding.matches.0_0.teachers': { id: String(secondTeacher), name: 'Second teacher' } } });
  await IntroductionSlot.create({ _id: 'other-teacher-slot', teacherId: secondTeacher, ...interval, meetingLink: 'https://example.com/other' });
  const result = await Promise.all([POST(req(target)), POST(req({ ...target, slotId: 'other-teacher-slot' }))]);
  expect(result.map(response => response.status).sort()).toEqual([200, 409]);
});
it('withdraws unbooked availability without exposing a learner booking', async () => {
  (getAuthSession as jest.Mock).mockResolvedValue({ user: { id: String(teacher), role: 'teacher' } });
  expect((await PATCH(req({ slotId: 'slot', action: 'withdraw' }))).status).toBe(200);
  expect((await IntroductionSlot.findById('slot').lean<any>())?.status).toBe('cancelled');
});
async function prepareFreeLesson(id = 'free-slot') {
  await User.updateOne({ _id: owner }, { $set: { 'parentProfile.onboarding.matches.0_0.selectedTeacherId': String(teacher), 'parentProfile.onboarding.matches.0_0.completedIntroductions': [String(teacher)] } });
  const freeStart = new Date(start.getTime() + 2 * 3600000);
  await IntroductionSlot.create({ _id: id, kind: 'free-lesson', teacherId: teacher, startTime: freeStart, endTime: new Date(freeStart.getTime() + 3600000), meetingLink: 'https://example.com/free-room' });
}
it('enables parent subject allowances without an environment setting', async () => {
  await prepareFreeLesson();
  expect((await POST(req({ ...target, slotId: 'free-slot' }))).status).toBe(200);
  expect((await IntroductionSlot.findById('free-slot').lean<any>()).status).toBe('booked');
});
it('blocks another free reservation for the same learner and subject even at another subject index', async () => {
  await prepareFreeLesson();
  expect((await POST(req({ ...target, slotId: 'free-slot' }))).status).toBe(200);
  const account: any = await User.findById(owner).lean();
  expect(account.freeLessonClaims.learner_0_yoruba.slotId).toBe('free-slot');
  await User.updateOne({ _id: owner }, { $set: { 'parentProfile.onboarding.matches.0_1': { subject: 'Yoruba', selectedTeacherId: String(teacher), completedIntroductions: [String(teacher)] } } });
  await IntroductionSlot.create({ _id: 'second-free', kind: 'free-lesson', teacherId: teacher, startTime: new Date(start.getTime() + 4 * 3600000), endTime: new Date(start.getTime() + 5 * 3600000), meetingLink: 'https://example.com/second' });
  expect((await POST(req({ ...target, subjectIndex: 1, slotId: 'second-free' }))).status).toBe(409);
});
it('gives each sibling a separate free lesson for the same subject', async () => {
  await prepareFreeLesson();
  expect((await POST(req({ ...target, slotId: 'free-slot' }))).status).toBe(200);
  await User.updateOne({ _id: owner }, { $push: { 'parentProfile.onboarding.learners': { name: 'Sibling' } }, $set: { 'parentProfile.onboarding.matches.1_0': { subject: 'Yoruba', selectedTeacherId: String(teacher), completedIntroductions: [String(teacher)] } } });
  await IntroductionSlot.create({ _id: 'sibling-free', kind: 'free-lesson', teacherId: teacher, startTime: new Date(start.getTime() + 4 * 3600000), endTime: new Date(start.getTime() + 5 * 3600000), meetingLink: 'https://example.com/sibling' });
  expect((await POST(req({ ...target, learner: 1, slotId: 'sibling-free' }))).status).toBe(200);
});
it('releases a future cancelled free reservation, retaining its audit history', async () => {
  await prepareFreeLesson();
  await POST(req({ ...target, slotId: 'free-slot' }));
  expect((await PATCH(req({ action: 'cancel', slotId: 'free-slot' }))).status).toBe(200);
  const account: any = await User.findById(owner).lean();
  expect(account.freeLessonClaims?.learner_0_yoruba).toBeUndefined();
  expect(account.parentProfile.onboarding.bookingHistory).toHaveLength(1);
  expect((await POST(req({ ...target, slotId: 'free-slot' }))).status).toBe(200);
});
it('blocks previous paid customers from the first-time offer', async () => {
  await prepareFreeLesson();
  await User.updateOne({ _id: owner }, { $set: { 'subscription.lastPayment': new Date() } });
  expect((await POST(req({ ...target, slotId: 'free-slot' }))).status).toBe(409);
});
it('keeps a free reservation claimed when it is rescheduled', async () => {
  await prepareFreeLesson();
  await POST(req({ ...target, slotId: 'free-slot' }));
  await IntroductionSlot.create({ _id: 'new-free', kind: 'free-lesson', teacherId: teacher, startTime: new Date(start.getTime() + 4 * 3600000), endTime: new Date(start.getTime() + 5 * 3600000), meetingLink: 'https://example.com/new' });
  expect((await PATCH(req({ action: 'reschedule', slotId: 'free-slot', replacementSlotId: 'new-free' }))).status).toBe(200);
  const account: any = await User.findById(owner).lean();
  expect(account.freeLessonClaims.learner_0_yoruba.slotId).toBe('new-free');
});
it('allows one free lesson for an independent learner without a parent policy setting', async () => {
  await prepareFreeLesson();
  const account: any = await User.findById(owner).lean();
  await User.updateOne({ _id: owner }, { $set: { role: 'student', studentProfile: { onboarding: account.parentProfile.onboarding } } });
  expect((await POST(req({ ...target, role: 'student', slotId: 'free-slot' }))).status).toBe(200);
  expect((await User.findById(owner).lean<any>()).freeLessonClaims.learner_0_yoruba.slotId).toBe('free-slot');
});
it('consumes an ended free booking without permitting cancellation or another claim', async () => {
  await prepareFreeLesson();
  await POST(req({ ...target, slotId: 'free-slot' }));
  await IntroductionSlot.updateOne({ _id: 'free-slot' }, { $set: { startTime: new Date(Date.now() - 7200000), endTime: new Date(Date.now() - 3600000) } });
  expect((await PATCH(req({ slotId: 'free-slot' }))).status).toBe(200);
  const account: any = await User.findById(owner).lean();
  expect(account.freeLessonClaims.learner_0_yoruba.completedAt).toBeInstanceOf(Date);
  expect(account.parentProfile.onboarding.matches['0_0'].freeLesson.completed).toBe(true);
  expect((await PATCH(req({ action: 'cancel', slotId: 'free-slot' }))).status).toBe(409);
});
it('protects a legacy reschedule from overwriting published trial availability', async () => {
  const legacy = await TeachingSession.create({ teacherId: teacher, studentId: owner, subject: { name: 'yoruba', area: 'languages' }, timezone: 'UTC', startTime: new Date(start.getTime() + 5 * 3600000), endTime: new Date(start.getTime() + 6 * 3600000), duration: 60, meetingLink: 'https://example.com/legacy' });
  const response = await updateLegacySession(req({ startTime: start.toISOString() }), { params: { id: String(legacy._id) } });
  expect(response.status).toBe(409);
  expect((await TeachingSession.findById(legacy._id).lean<any>()).startTime).toEqual(legacy.startTime);
});
it('runs the actual legacy creation route against a concurrent trial publisher', async () => {
  await IntroductionSlot.deleteMany({});
  (getAuthSession as jest.Mock).mockResolvedValue({ user: { id: String(teacher), role: 'teacher' } });
  const result = await Promise.all([
    POST(req({ startTime: start.toISOString(), meetingLink: 'https://example.com/trial' })),
    createLegacySession(req({ courseId: 'subject-yoruba', startTime: start.toISOString(), duration: 60, students: [String(owner)], externalLink: 'https://example.com/legacy', timezone: 'UTC' })),
  ]);
  expect(result.map(response => response.status).sort()).toEqual([200, 409]);
});
it.each(['parent', 'student'])('allows a %s learner both Yoruba and AI, including after starting paid Yoruba', async role => {
  await prepareFreeLesson();
  if (role === 'student') {
    const existing: any = await User.findById(owner).lean();
    await User.updateOne({ _id: owner }, { $set: { role, studentProfile: { onboarding: existing.parentProfile.onboarding } } });
  }
  expect((await POST(req({ ...target, role, slotId: 'free-slot' }))).status).toBe(200);
  const path = `${role}Profile.onboarding`;
  await User.updateOne({ _id: teacher }, { $push: { 'teacherProfile.subjects': { area: 'stem', subjects: ['ai'] } } });
  await User.updateOne({ _id: owner }, { $set: {
    'subscription.status': 'active', 'subscription.lastPayment': new Date(),
    [`${path}.matches.0_1`]: { subject: 'Artificial Intelligence', selectedTeacherId: String(teacher), completedIntroductions: [String(teacher)] },
  } });
  await IntroductionSlot.create({ _id: 'ai-free', kind: 'free-lesson', teacherId: teacher, startTime: new Date(start.getTime() + 4 * 3600000), endTime: new Date(start.getTime() + 5 * 3600000), meetingLink: 'https://example.com/ai' });
  expect((await POST(req({ ...target, role, subjectIndex: 1, slotId: 'ai-free' }))).status).toBe(200);
  const result: any = await User.findById(owner).lean();
  expect(Object.keys(result.freeLessonClaims).sort()).toEqual(['learner_0_artificial_intelligence', 'learner_0_yoruba']);
});
it('retains a previous-format subject claim without blocking a different subject', async () => {
  await prepareFreeLesson();
  await User.updateOne({ _id: owner }, { $set: { freeLessonClaims: { learner_0: { slotId: 'old', learner: 0, subject: 'Yoruba', completedAt: new Date() } } } });
  expect((await POST(req({ ...target, slotId: 'free-slot' }))).status).toBe(409);
});
