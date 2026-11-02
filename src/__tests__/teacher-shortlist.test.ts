jest.mock('@/lib/auth', () => ({ getAuthSession: jest.fn() }));
jest.mock('@/lib/mongodb', () => ({ connectDB: jest.fn() }));
jest.mock('@/models/user', () => ({ User: { find: jest.fn(), findOne: jest.fn(), updateOne: jest.fn() } }));
import { getAuthSession } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/user';
import { GET, POST, PATCH } from '@/app/api/learning-plan/matches/route';
import { teachesSubject } from '@/lib/teacher-shortlist';
const ownerId = 'a'.repeat(24);
const ids = ['b', 'c', 'd'].map(c => c.repeat(24));
const target = { ownerId, role: 'parent', learner: 0, subjectIndex: 0 };
const teachers = ids.map((_id, index) => ({ _id, name: `Teacher ${index}`, email: 'private@example.com', teacherProfile: { subjects: [{ area: 'languages', subjects: ['yoruba'] }], qualifications: [{ document: 'private-document' }] } }));
const request = (body: unknown) => new Request('http://localhost/api', { method: 'POST', body: JSON.stringify(body) });
const query = (value: unknown) => ({ select: jest.fn().mockReturnValue({ lean: async () => value }) });
let intake: any;
beforeEach(() => {
  jest.clearAllMocks();
  (getAuthSession as jest.Mock).mockResolvedValue({ user: { id: 'admin', role: 'admin' } });
  intake = { learners: [{ name: 'Learner', ageGroup: '6-8', level: 'beginner', subjects: ['Yoruba', 'Artificial Intelligence'], prioritySubject: 'Yoruba', goals: 'Speak with family and learn AI' }], timezone: 'Africa/Lagos', preferredDays: ['Monday'], preferredTime: 'evening', status: 'reviewing' };
  (User.findOne as jest.Mock).mockImplementation(() => query({ parentProfile: { onboarding: intake } }));
  (User.find as jest.Mock).mockImplementation(() => query(teachers));
  (User.updateOne as jest.Mock).mockResolvedValue({ matchedCount: 1 });
});
function shortlist(completed = ids) {
  intake.matches = { '0_0': { subject: 'Yoruba', teachers: teachers.map(t => ({ id: t._id, name: t.name, bio: '' })), completedIntroductions: completed } };
}
it.each([['Mathematics', 'math'], ['Computer Science', 'cs'], ['Artificial Intelligence', 'ai'], ['Yoruba', 'YORUBA']])('matches %s to existing teacher code %s', (subject, code) => {
  expect(teachesSubject({ teacherProfile: { subjects: [{ subjects: [code] }] } }, subject)).toBe(true);
});
it('denies teacher accounts access to learner teacher choices', async () => {
  (getAuthSession as jest.Mock).mockResolvedValue({ user: { role: 'teacher' } });
  expect((await GET(new Request('http://localhost/api?subject=Yoruba'))).status).toBe(403);
  expect(connectDB).not.toHaveBeenCalled();
});
it('returns teacher choices without private documents or email', async () => {
  const response = await GET(new Request('http://localhost/api?subject=Yoruba'));
  const result = await response.json();
  expect(result.teachers).toHaveLength(3);
  expect(JSON.stringify(result)).not.toContain('private');
  expect(User.find).toHaveBeenCalledWith(expect.objectContaining({ role: 'teacher', isActive: true, 'teacherProfile.verificationStatus': 'verified' }));
});
it('publishes existing teacher IDs with an atomic no-overwrite guard', async () => {
  expect((await POST(request({ ...target, teacherIds: ids }))).status).toBe(200);
  const [filter, update] = (User.updateOne as jest.Mock).mock.calls[0];
  expect(filter['parentProfile.onboarding.matches.0_0']).toEqual({ $exists: false });
  expect(filter['parentProfile.onboarding.learners']).toEqual(intake.learners);
  expect(update.$set['parentProfile.onboarding.matches.0_0'].teachers.map((t: any) => t.id)).toEqual(ids);
});
it('publishes a separate introduction track for another subject selected by the same child', async () => {
  const aiTeachers = teachers.map(teacher => ({ ...teacher, teacherProfile: { subjects: [{ area: 'stem', subjects: ['ai'] }] } }));
  (User.find as jest.Mock).mockReturnValue(query(aiTeachers));
  expect((await POST(request({ ...target, subjectIndex: 1, teacherIds: ids }))).status).toBe(200);
  const [filter, update] = (User.updateOne as jest.Mock).mock.calls[0];
  expect(filter['parentProfile.onboarding.matches.0_1']).toEqual({ $exists: false });
  expect(update.$set['parentProfile.onboarding.matches.0_1'].subject).toBe('Artificial Intelligence');
});
it('rejects duplicate teachers', async () => {
  expect((await POST(request({ ...target, teacherIds: [ids[0], ids[0], ids[1]] }))).status).toBe(400);
  expect(connectDB).not.toHaveBeenCalled();
});
it('rejects a teacher who does not teach the subject', async () => {
  (User.find as jest.Mock).mockReturnValue(query([teachers[0], teachers[1], { ...teachers[2], teacherProfile: { subjects: [] } }]));
  expect((await POST(request({ ...target, teacherIds: ids }))).status).toBe(400);
  expect(User.updateOne).not.toHaveBeenCalled();
});
it('prevents learners recording attendance', async () => {
  (getAuthSession as jest.Mock).mockResolvedValue({ user: { id: ownerId, role: 'parent' } });
  expect((await PATCH(request({ ...target, action: 'complete-introduction', teacherId: ids[0] }))).status).toBe(403);
  expect(connectDB).not.toHaveBeenCalled();
});
it('blocks completion outside the booked introduction workflow', async () => {
  shortlist([]);
  expect((await PATCH(request({ ...target, action: 'complete-introduction', teacherId: ids[0] }))).status).toBe(409);
  expect(User.updateOne).not.toHaveBeenCalled();
});
it('blocks choosing a teacher on another account', async () => {
  (getAuthSession as jest.Mock).mockResolvedValue({ user: { id: 'e'.repeat(24), role: 'parent' } });
  expect((await PATCH(request({ ...target, action: 'select', teacherId: ids[0] }))).status).toBe(403);
  expect(connectDB).not.toHaveBeenCalled();
});
it('requires completion of all three introductions before selection', async () => {
  shortlist([ids[0]]);
  (getAuthSession as jest.Mock).mockResolvedValue({ user: { id: ownerId, role: 'parent' } });
  expect((await PATCH(request({ ...target, action: 'select', teacherId: ids[0] }))).status).toBe(409);
  expect(User.updateOne).not.toHaveBeenCalled();
});
it('rechecks teacher eligibility and atomically saves the owner selection', async () => {
  shortlist();
  (getAuthSession as jest.Mock).mockResolvedValue({ user: { id: ownerId, role: 'parent' } });
  (User.findOne as jest.Mock).mockReturnValueOnce(query({ parentProfile: { onboarding: intake } })).mockReturnValueOnce(query(teachers[0]));
  expect((await PATCH(request({ ...target, action: 'select', teacherId: ids[0] }))).status).toBe(200);
  const [filter, update] = (User.updateOne as jest.Mock).mock.calls[0];
  expect(filter['parentProfile.onboarding.matches.0_0.selectedTeacherId']).toEqual({ $exists: false });
  expect(update.$set['parentProfile.onboarding.matches.0_0.selectedTeacherId']).toBe(ids[0]);
});
it('rejects competing or repeated selections', async () => {
  shortlist();
  (getAuthSession as jest.Mock).mockResolvedValue({ user: { id: ownerId, role: 'parent' } });
  (User.findOne as jest.Mock).mockReturnValueOnce(query({ parentProfile: { onboarding: intake } })).mockReturnValueOnce(query(teachers[0]));
  (User.updateOne as jest.Mock).mockResolvedValue({ matchedCount: 0 });
  expect((await PATCH(request({ ...target, action: 'select', teacherId: ids[0] }))).status).toBe(409);
});
it('supports an independent student choosing their own teacher', async () => {
  shortlist();
  (getAuthSession as jest.Mock).mockResolvedValue({ user: { id: ownerId, role: 'student' } });
  (User.findOne as jest.Mock).mockReturnValueOnce(query({ studentProfile: { onboarding: intake } })).mockReturnValueOnce(query(teachers[0]));
  expect((await PATCH(request({ ...target, role: 'student', action: 'select', teacherId: ids[0] }))).status).toBe(200);
  expect((User.updateOne as jest.Mock).mock.calls[0][1].$set['studentProfile.onboarding.matches.0_0.selectedTeacherId']).toBe(ids[0]);
});
it('rejects selecting a teacher outside the shortlist', async () => {
  shortlist();
  (getAuthSession as jest.Mock).mockResolvedValue({ user: { id: ownerId, role: 'parent' } });
  expect((await PATCH(request({ ...target, action: 'select', teacherId: 'e'.repeat(24) }))).status).toBe(400);
  expect(User.updateOne).not.toHaveBeenCalled();
});
it('rejects teachers whose eligibility has been revoked', async () => {
  shortlist();
  (getAuthSession as jest.Mock).mockResolvedValue({ user: { id: ownerId, role: 'parent' } });
  (User.findOne as jest.Mock).mockReturnValueOnce(query({ parentProfile: { onboarding: intake } })).mockReturnValueOnce(query(null));
  expect((await PATCH(request({ ...target, action: 'select', teacherId: ids[0] }))).status).toBe(409);
  expect(User.updateOne).not.toHaveBeenCalled();
});

it.each([1, 2, 3])('lets parents choose %s existing teachers for their own request', async count => {
  (getAuthSession as jest.Mock).mockResolvedValue({ user: { id: ownerId, role: 'parent' } });
  (User.find as jest.Mock).mockReturnValue(query(teachers.slice(0, count)));
  expect((await POST(request({ ...target, teacherIds: ids.slice(0, count) }))).status).toBe(200);
});
it.each([{ teacherIds: [] }, { teacherIds: [...ids, 'e'.repeat(24)] }])('rejects a teacher choice count outside one to three', async ({ teacherIds }) => {
  expect((await POST(request({ ...target, teacherIds }))).status).toBe(400);
  expect(User.updateOne).not.toHaveBeenCalled();
});
it('rejects choosing introductions for a different parent', async () => {
  (getAuthSession as jest.Mock).mockResolvedValue({ user: { id: 'e'.repeat(24), role: 'parent' } });
  expect((await POST(request({ ...target, teacherIds: ids }))).status).toBe(403);
  expect(connectDB).not.toHaveBeenCalled();
});
it('allows independent learners to browse teachers', async () => {
  (getAuthSession as jest.Mock).mockResolvedValue({ user: { id: ownerId, role: 'student' } });
  expect((await GET(new Request('http://localhost/api?subject=Yoruba'))).status).toBe(200);
});
it('allows final selection after the single chosen introduction', async () => {
  shortlist([ids[0]]); intake.matches['0_0'].teachers = intake.matches['0_0'].teachers.slice(0, 1);
  (getAuthSession as jest.Mock).mockResolvedValue({ user: { id: ownerId, role: 'parent' } });
  (User.findOne as jest.Mock).mockReturnValueOnce(query({ parentProfile: { onboarding: intake } })).mockReturnValueOnce(query(teachers[0]));
  expect((await PATCH(request({ ...target, action: 'select', teacherId: ids[0] }))).status).toBe(200);
});
