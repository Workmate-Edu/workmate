jest.mock('@/lib/mongodb', () => ({ connectDB: jest.fn() }));
jest.mock('@/models/user', () => ({ User: { findOne: jest.fn(), findById: jest.fn(), findByIdAndUpdate: jest.fn() } }));
jest.mock('@/models/child-assessment', () => ({ ChildAssessment: {} }));
jest.mock('@/models/initial-assessment', () => ({ InitialAssessment: {} }));
jest.mock('@/models/earning', () => ({ Earning: { create: jest.fn() } }));
jest.mock('@/models/teaching-session', () => ({ TeachingSession: { findById: jest.fn(), findByIdAndUpdate: jest.fn() } }));
jest.mock('@/lib/sendSmtpMail', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/lib/notification-service', () => ({ sendSessionNotification: jest.fn() }));
jest.mock('@/lib/services/teacher-eligibility', () => ({ findEligibleTeachers: jest.fn(async () => []) }));
jest.mock('@/lib/tokens', () => ({ generateVerificationToken: jest.fn() }));

import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import { TeachingSession } from '@/models/teaching-session';
import { POST as signup } from '@/app/api/auth/sign-up/route';
import { POST as assign } from '@/app/api/admin/assign-teacher/route';
import { GET as eligible } from '@/app/api/admin/teachers/eligible/route';
import { POST as complete } from '@/app/api/sessions/[id]/complete/route';

beforeEach(() => jest.clearAllMocks());
const request = () => new Request('https://example.com/api/test', { method: 'POST', body: '{}' });

it.each(['admin', 'blogger', 'unknown', '', null])('rejects public signup role %s before database access', async role => {
  const response = await signup(new Request('https://example.com/api/auth/sign-up', { method: 'POST', body: JSON.stringify({ role }) }));
  expect(response.status).toBe(400);
  expect(await response.json()).toEqual({ error: 'Invalid account role' });
  expect(connectDB).not.toHaveBeenCalled();
});

it.each([null, 'parent', 'student', 'teacher', 'unknown'])('denies administrative operations for %s', async role => {
  (getServerSession as jest.Mock).mockResolvedValue(role ? { user: { id: 'caller', role } } : null);
  expect((await assign(request())).status).toBe(role ? 403 : 401);
  expect((await eligible(new Request('https://example.com/api/test?subjects=[]'))).status).toBe(role ? 403 : 401);
  expect(connectDB).not.toHaveBeenCalled();
});

it('allows an administrator to search eligible teachers', async () => {
  (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'admin', role: 'admin' } });
  expect((await eligible(new Request('https://example.com/api/test?subjects=[]'))).status).toBe(200);
  expect(connectDB).toHaveBeenCalledTimes(1);
});

it('denies completion by an unrelated teacher before any write', async () => {
  (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'other', role: 'teacher' } });
  (TeachingSession.findById as jest.Mock).mockReturnValue({ lean: async () => ({ teacherId: 'owner', status: 'teacher-completed' }) });
  expect((await complete(request(), { params: { id: 'lesson' } })).status).toBe(403);
  expect(TeachingSession.findByIdAndUpdate).not.toHaveBeenCalled();
});

it.each(['teacher', 'admin'])('allows %s through ownership checks while preserving status validation', async role => {
  (getServerSession as jest.Mock).mockResolvedValue({ user: { id: role === 'teacher' ? 'owner' : 'admin', role } });
  (TeachingSession.findById as jest.Mock).mockReturnValue({ lean: async () => ({ teacherId: 'owner', status: 'scheduled' }) });
  expect((await complete(request(), { params: { id: 'lesson' } })).status).toBe(400);
  expect(TeachingSession.findByIdAndUpdate).not.toHaveBeenCalled();
});
