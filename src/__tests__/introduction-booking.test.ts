jest.mock('@/lib/scheduling', () => {
  class SchedulingError extends Error {}
  return { SchedulingError, scheduleTransaction: jest.fn(async (_id, work) => {
    const transaction = await require('mongoose').default.startSession();
    try { let result; await transaction.withTransaction(async () => { result = await work(transaction); }); return result; }
    finally { await transaction.endSession(); }
  }), assertScheduleAvailable: jest.fn(async () => {
    if (await require('@/models/teaching-session').TeachingSession.exists({})) throw new SchedulingError('This time overlaps an existing lesson');
  }) };
});
jest.mock('@/lib/auth', () => ({ getAuthSession: jest.fn() }));
jest.mock('@/lib/mongodb', () => ({ connectDB: jest.fn() }));
jest.mock('@/models/user', () => ({ User: { findById: jest.fn(), findOne: jest.fn(), exists: jest.fn(), updateOne: jest.fn() } }));
jest.mock('@/models/introduction-slot', () => ({ IntroductionSlot: { find: jest.fn(), findOne: jest.fn(), create: jest.fn(), updateOne: jest.fn() } }));
jest.mock('@/models/teaching-session', () => ({ TeachingSession: { exists: jest.fn() } }));
jest.mock('@/models/session', () => ({ Session: { exists: jest.fn() } }));
jest.mock('@/models/schedule', () => ({ Schedule: { exists: jest.fn() }, TeacherSchedule: { exists: jest.fn() } }));
import mongoose from 'mongoose';
import { getAuthSession } from '@/lib/auth';
import { User } from '@/models/user';
import { IntroductionSlot } from '@/models/introduction-slot';
import { TeachingSession } from '@/models/teaching-session';
import { GET, POST, PATCH } from '@/app/api/introductions/route';
import { introductionTimes, overlaps, publishIntroductionSchema } from '@/lib/introduction-booking';
const ownerId = 'a'.repeat(24), teacherId = 'b'.repeat(24);
const startTime = new Date(Math.ceil((Date.now() + 86400000) / 900000) * 900000);
const endTime = new Date(startTime.getTime() + 900000);
const target = { slotId: 'slot', ownerId, role: 'parent', learner: 0, subjectIndex: 0 };
const slot = { _id: 'slot', teacherId, startTime, endTime, meetingLink: 'https://meet.example.com/room', ownerId, ownerRole: 'parent', matchKey: '0_0' };
const query = (value: unknown): any => { const q: any = { select: () => q, sort: () => q, session: () => q, lean: async () => value }; return q; };
const req = (body: unknown) => new Request('http://localhost/api', { method: 'POST', body: JSON.stringify(body) });
const transaction = { withTransaction: jest.fn(async callback => callback()), endSession: jest.fn() };
let intake: any;
beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(mongoose, 'startSession').mockResolvedValue(transaction as any);
  (getAuthSession as jest.Mock).mockResolvedValue({ user: { id: ownerId, role: 'parent' } });
  intake = { learners: [{ name: 'Learner' }], matches: { '0_0': { subject: 'Yoruba', teachers: [{ id: teacherId }], completedIntroductions: [] } } };
  (User.findById as jest.Mock).mockReturnValue(query({ role: 'parent', safeguarding: { parentalVerification: { status: 'verified' } } }));
  (User.findOne as jest.Mock).mockImplementation((filter: any) => query(filter.role === 'teacher' ? { teacherProfile: { subjects: [{ subjects: ['yoruba'] }] } } : { role: 'parent', safeguarding: { parentalVerification: { status: 'verified' } }, parentProfile: { onboarding: intake } }));
  (IntroductionSlot.findOne as jest.Mock).mockReturnValue(query(slot));
  (IntroductionSlot.updateOne as jest.Mock).mockResolvedValue({ matchedCount: 1 });
  (User.updateOne as jest.Mock).mockResolvedValue({ matchedCount: 1 });
  (User.exists as jest.Mock).mockResolvedValue({ _id: teacherId });
  (TeachingSession.exists as jest.Mock).mockResolvedValue(null);
});
it('accepts only future quarter-hour starts within 90 days', () => {
  expect(introductionTimes(startTime.toISOString()).endTime).toEqual(endTime);
  expect(() => introductionTimes(new Date(startTime.getTime() + 1000).toISOString())).toThrow();
  expect(() => introductionTimes(new Date(Date.now() - 1000).toISOString())).toThrow();
  expect(() => introductionTimes(new Date(Date.now() + 91 * 86400000).toISOString())).toThrow();
});
it('requires a real HTTPS link and rejects embedded credentials', () => {
  expect(publishIntroductionSchema.safeParse({ startTime: startTime.toISOString(), meetingLink: 'https://meet.google.com/abc-defg-hij' }).success).toBe(true);
  expect(publishIntroductionSchema.safeParse({ startTime: startTime.toISOString(), meetingLink: 'https://us02web.zoom.us/j/123456' }).success).toBe(true);
  expect(publishIntroductionSchema.safeParse({ startTime: startTime.toISOString(), meetingLink: 'https://meet.example.com/room' }).success).toBe(false);
  expect(publishIntroductionSchema.safeParse({ startTime: startTime.toISOString(), meetingLink: 'javascript:alert(1)' }).success).toBe(false);
  expect(publishIntroductionSchema.safeParse({ startTime: startTime.toISOString(), meetingLink: 'https://user:secret@example.com' }).success).toBe(false);
});
it('allows adjacent slots but detects overlapping slots', () => {
  expect(overlaps(slot, { startTime: endTime, endTime: new Date(endTime.getTime() + 900000) })).toBe(false);
  expect(overlaps(slot, slot)).toBe(true);
});
it('blocks booking another account before opening a transaction', async () => {
  expect((await POST(req({ ...target, ownerId: 'c'.repeat(24) }))).status).toBe(403);
  expect(transaction.withTransaction).not.toHaveBeenCalled();
});
it.each(['parent', 'admin'])('books through the same transaction for %s', async role => {
  (getAuthSession as jest.Mock).mockResolvedValue({ user: { id: role === 'admin' ? 'admin' : ownerId, role } });
  expect((await POST(req(target))).status).toBe(200);
  expect(transaction.withTransaction).toHaveBeenCalled();
  expect(IntroductionSlot.updateOne).toHaveBeenCalledWith({ _id: 'slot', status: 'available' }, expect.objectContaining({ $set: expect.objectContaining({ bookedBy: role === 'admin' ? 'admin' : ownerId }) }), { session: transaction });
  expect(User.updateOne).toHaveBeenCalledWith(expect.anything(), expect.anything(), { session: transaction });
  expect(transaction.endSession).toHaveBeenCalled();
});
it('rejects a teacher outside the saved choices', async () => {
  intake.matches['0_0'].teachers = [];
  expect((await POST(req(target))).status).toBe(409);
  expect(IntroductionSlot.updateOne).not.toHaveBeenCalled();
});
it('rejects repeated introduction bookings', async () => {
  intake.matches['0_0'].bookings = { [teacherId]: slot };
  expect((await POST(req(target))).status).toBe(409);
});
it('rejects an overlapping introduction for the same learner in another subject', async () => {
  intake.matches['0_1'] = { bookings: { other: slot } };
  expect((await POST(req(target))).status).toBe(409);
});
it('rejects a slot lost to another booking', async () => {
  (IntroductionSlot.updateOne as jest.Mock).mockResolvedValue({ matchedCount: 0 });
  expect((await POST(req(target))).status).toBe(409);
  expect(User.updateOne).not.toHaveBeenCalled();
});
it('rejects existing legacy lesson conflicts', async () => {
  (TeachingSession.exists as jest.Mock).mockResolvedValue({ _id: 'existing' });
  expect((await POST(req(target))).status).toBe(409);
  expect(IntroductionSlot.updateOne).not.toHaveBeenCalled();
});
it('fails closed when transactions are unavailable', async () => {
  transaction.withTransaction.mockRejectedValueOnce(new Error('Transactions unavailable'));
  expect((await POST(req(target))).status).toBe(500);
  expect(IntroductionSlot.updateOne).not.toHaveBeenCalled();
});
it('does not expose meeting links in available-slot queries', async () => {
  const q = query([{ _id: 'slot', startTime, endTime }]);
  q.select = jest.fn(() => q);
  (IntroductionSlot.find as jest.Mock).mockReturnValue(q);
  const response = await GET(new Request(`http://localhost/api?teacherId=${teacherId}`));
  expect(q.select).toHaveBeenCalledWith('_id startTime endTime');
  expect(JSON.stringify(await response.json())).not.toContain('meetingLink');
});
it('holds parent availability while parental verification is pending', async () => {
  (User.findById as jest.Mock).mockReturnValue(query({ role: 'parent', safeguarding: { parentalVerification: { status: 'pending' } } }));
  const response = await GET(new Request(`http://localhost/api?teacherId=${teacherId}`));
  expect(response.status).toBe(403);
  expect(IntroductionSlot.find).not.toHaveBeenCalled();
});
it('denies learner completion', async () => {
  expect((await PATCH(req({ slotId: 'slot' }))).status).toBe(403);
});
it('restricts teacher completion to their ended, booked introduction', async () => {
  (getAuthSession as jest.Mock).mockResolvedValue({ user: { id: teacherId, role: 'teacher' } });
  expect((await PATCH(req({ slotId: 'slot' }))).status).toBe(200);
  expect(IntroductionSlot.findOne).toHaveBeenCalledWith(expect.objectContaining({ teacherId, status: 'booked', endTime: { $lte: expect.any(Date) } }));
});
it('rejects completion when the booking has not ended or belongs to another teacher', async () => {
  (getAuthSession as jest.Mock).mockResolvedValue({ user: { id: teacherId, role: 'teacher' } });
  (IntroductionSlot.findOne as jest.Mock).mockReturnValue(query(null));
  expect((await PATCH(req({ slotId: 'slot' }))).status).toBe(404);
  expect(User.updateOne).not.toHaveBeenCalled();
});
jest.mock('@/lib/booking-notifications', () => ({ recordBookingNotifications: jest.fn() }));
