jest.mock('@/lib/auth', () => ({ getAuthSession: jest.fn() }));
jest.mock('@/lib/mongodb', () => ({ connectDB: jest.fn() }));
jest.mock('@/models/user', () => ({ User: { findOne: jest.fn(), updateOne: jest.fn() } }));
import { getAuthSession } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/user';
import { GET, PUT } from '@/app/api/learning-plan/route';
import { PATCH } from '@/app/api/admin/matching-requests/route';
const intake = { learners: [{ name: 'Learner', ageGroup: '18+', level: 'beginner', subjects: ['Yoruba'], prioritySubject: 'Yoruba', goals: 'Speak with family' }], timezone: 'Africa/Lagos', preferredDays: ['Monday'], preferredTime: 'evening' };
const ownerId = '111111111111111111111111';
const request = (body: unknown) => new Request('http://localhost/api', { method: 'POST', body: JSON.stringify(body) });
beforeEach(() => {
  jest.clearAllMocks();
  (User.findOne as jest.Mock).mockReturnValue({ select: () => ({ lean: async () => ({}) }) });
  (User.updateOne as jest.Mock).mockResolvedValue({ matchedCount: 1 });
});
it.each(['parent', 'student'])('saves only the verified %s account request, ignoring client status and owner', async role => {
  (getAuthSession as jest.Mock).mockResolvedValue({ user: { id: ownerId, role } });
  const roleIntake = role === 'parent' ? { ...intake, learners: [{ ...intake.learners[0], age: 8, ageGroup: '6-8' }] } : intake;
  expect((await PUT(request({ ...roleIntake, userId: 'victim', status: 'contacting' }))).status).toBe(200);
  const [filter, update] = (User.updateOne as jest.Mock).mock.calls[0];
  expect(filter).toMatchObject({ _id: ownerId, role, emailVerified: true });
  expect(update.$set[`${role}Profile.onboarding`].status).toBe('pending');
  expect(update.$set[`${role}Profile.onboarding`].userId).toBeUndefined();
  expect(update.$set[`${role}Profile.onboarding`].learners[0].learnerId).toMatch(/^[a-f\d]{24}$/);
});
it('prevents independent learners submitting multiple people', async () => {
  (getAuthSession as jest.Mock).mockResolvedValue({ user: { id: ownerId, role: 'student' } });
  expect((await PUT(request({ ...intake, learners: [...intake.learners, ...intake.learners] }))).status).toBe(400);
  expect(connectDB).not.toHaveBeenCalled();
});
it.each([null, 'teacher', 'admin'])('denies intake writes for %s', async role => {
  (getAuthSession as jest.Mock).mockResolvedValue(role ? { user: { role } } : null);
  expect([401, 403]).toContain((await PUT(request(intake))).status);
  expect(connectDB).not.toHaveBeenCalled();
});
it.each(['parent', 'student', 'teacher'])('denies admin progress updates by %s', async role => {
  (getAuthSession as jest.Mock).mockResolvedValue({ user: { role } });
  expect((await PATCH(request({}))).status).toBe(403);
  expect(connectDB).not.toHaveBeenCalled();
});
it('uses atomic status comparison for admin updates and rejects stale requests', async () => {
  (getAuthSession as jest.Mock).mockResolvedValue({ user: { id: 'admin', role: 'admin' } });
  (User.updateOne as jest.Mock).mockResolvedValue({ matchedCount: 0 });
  expect((await PATCH(request({ id: 'a'.repeat(24), role: 'student', from: 'pending', status: 'reviewing', note: 'Finding teachers' }))).status).toBe(409);
  expect(User.updateOne).toHaveBeenCalledWith(expect.objectContaining({ emailVerified: true, 'studentProfile.onboarding.status': 'pending' }), expect.objectContaining({ $set: expect.objectContaining({ 'studentProfile.onboarding.updatedBy': 'admin' }) }));
});
it('does not silently overwrite an intake already being matched', async () => {
  (getAuthSession as jest.Mock).mockResolvedValue({ user: { id: ownerId, role: 'parent' } });
  (User.updateOne as jest.Mock).mockResolvedValue({ matchedCount: 0 });
  expect((await PUT(request({ ...intake, learners: [{ ...intake.learners[0], age: 8, ageGroup: '6-8' }] }))).status).toBe(409);
});

it('returns a persistent next learning-plan action for a verified parent', async () => {
  (getAuthSession as jest.Mock).mockResolvedValue({ user: { id: ownerId, role: 'parent' } });
  (User.findOne as jest.Mock).mockReturnValue({ select: () => ({ lean: async () => ({
    safeguarding: { parentalVerification: { status: 'verified' } },
    parentProfile: { onboarding: { ...intake, learners: [{ ...intake.learners[0], age: 8, ageGroup: '6-8' }] } },
  }) }) });
  const response = await GET();
  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toMatchObject({
    title: 'Choose introduction teachers',
    action: 'Continue learning plan',
    step: 1,
    total: 1,
  });
});

it('does not expose the parent learning-plan summary to other roles', async () => {
  (getAuthSession as jest.Mock).mockResolvedValue({ user: { id: ownerId, role: 'teacher' } });
  expect((await GET()).status).toBe(403);
  expect(connectDB).not.toHaveBeenCalled();
});
