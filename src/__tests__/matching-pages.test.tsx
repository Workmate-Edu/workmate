jest.mock('@/lib/auth', () => ({ getAuthSession: jest.fn() }));
jest.mock('@/lib/mongodb', () => ({ connectDB: jest.fn() }));
jest.mock('@/models/user', () => ({ User: { find: jest.fn(), findById: jest.fn() } }));
jest.mock('next/navigation', () => ({ redirect: jest.fn((path: string) => { throw new Error(`redirect:${path}`); }) }));
import { getAuthSession } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/user';
import MatchingPage from '@/app/dashboard/admin/matching-requests/page';
import LearningPage from '@/app/dashboard/parent/learning-plan/page';
beforeEach(() => jest.clearAllMocks());
it.each([null, 'parent', 'student', 'teacher'])('denies matching list to %s', async role => {
  (getAuthSession as jest.Mock).mockResolvedValue(role ? { user: { id: 'caller', role } } : null);
  await expect(MatchingPage()).rejects.toThrow('redirect:');
  expect(connectDB).not.toHaveBeenCalled();
});
it('limits the matching list to verified parents with pending intake', async () => {
  (getAuthSession as jest.Mock).mockResolvedValue({ user: { id: 'admin', role: 'admin' } });
  (User.find as jest.Mock).mockReturnValue({ select: () => ({ sort: () => ({ limit: () => ({ lean: async () => [] }) }) }) });
  await MatchingPage();
  expect(User.find).toHaveBeenCalledWith({ emailVerified: true, $or: [{ role: 'parent', 'parentProfile.onboarding.status': { $in: ['pending', 'reviewing', 'contacting'] } }, { role: 'student', 'studentProfile.onboarding.status': { $in: ['pending', 'reviewing', 'contacting'] } }] });
});
it('reads only the logged-in parent’s learning preferences', async () => {
  (getAuthSession as jest.Mock).mockResolvedValue({ user: { id: 'current-parent', role: 'parent' } });
  (User.findById as jest.Mock).mockReturnValue({ select: () => ({ lean: async () => ({ name: "Parent", emailVerified: true }) }) });
  await LearningPage();
  expect(User.findById).toHaveBeenCalledWith('current-parent');
});
