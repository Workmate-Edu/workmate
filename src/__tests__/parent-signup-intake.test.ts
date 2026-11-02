jest.mock('@/lib/mongodb', () => ({ connectDB: jest.fn() }));
jest.mock('bcryptjs', () => ({ hash: jest.fn(async () => 'test-hash') }));
jest.mock('@/lib/tokens', () => ({ generateVerificationToken: jest.fn(() => 'test-token') }));
jest.mock('@/lib/sendSmtpMail', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/models/user', () => {
  const User = jest.fn().mockImplementation(function (this: any, data: any) {
    Object.assign(this, data, { _id: '111111111111111111111111' });
    this.save = jest.fn(async () => this);
    this.toObject = () => ({ ...data, _id: this._id });
  });
  return { User: Object.assign(User, { findOne: jest.fn(async () => null) }) };
});
import { POST } from '@/app/api/auth/sign-up/route';
import { User } from '@/models/user';
import { connectDB } from '@/lib/mongodb';

const intake = { learners: [{ name: 'Ada', age: 8, ageGroup: '6-8', level: 'beginner', subjects: ['Yoruba'], prioritySubject: 'Yoruba', goals: 'Speak with family' }], timezone: 'Africa/Lagos', preferredDays: ['Saturday'], preferredTime: 'morning' };
const body = { role: 'parent', name: 'Parent', email: 'parent@example.com', username: 'parent', password: 'test-only-password', gender: 'female', phone: '+2348012345678', residenceCountry: 'NG', termsAccepted: true, privacyAcknowledged: true, parentalAuthority: true, marketingOptIn: false, parentProfile: { onboarding: intake } };
beforeEach(() => jest.clearAllMocks());
it('persists validated matching preferences with server-owned pending status during signup', async () => {
  const response = await POST(new Request('https://example.com', { method: 'POST', body: JSON.stringify({ ...body, parentProfile: { onboarding: { ...intake, status: 'approved' } } }) }));
  expect(response.status).toBe(200);
  expect(User).toHaveBeenCalledWith(expect.objectContaining({ parentProfile: expect.objectContaining({ onboarding: {
    ...intake,
    learners: [expect.objectContaining({ ...intake.learners[0], learnerId: expect.stringMatching(/^[a-f\d]{24}$/) })],
    status: 'pending', submittedAt: expect.any(Date),
  } }) }));
});
it('rejects invalid intake before creating an account', async () => {
  const response = await POST(new Request('https://example.com', { method: 'POST', body: JSON.stringify({ ...body, parentProfile: { onboarding: { ...intake, timezone: 'invalid' } } }) }));
  expect(response.status).toBe(400);
  expect(User).not.toHaveBeenCalled();
  expect(connectDB).not.toHaveBeenCalled();
});
it('rejects signup when required legal choices are only implied', async () => {
  const response = await POST(new Request('https://example.com', { method: 'POST', body: JSON.stringify({ ...body, termsAccepted: false }) }));
  expect(response.status).toBe(400);
  expect(connectDB).not.toHaveBeenCalled();
});
it('rejects an invalid phone number before creating an account', async () => {
  const response = await POST(new Request('https://example.com', { method: 'POST', body: JSON.stringify({ ...body, phone: '+234' }) }));
  expect(response.status).toBe(400);
  expect(await response.json()).toMatchObject({ error: expect.stringMatching(/valid phone number/i) });
  expect(User).not.toHaveBeenCalled();
  expect(connectDB).not.toHaveBeenCalled();
});
it('rejects signup without a gender before creating an account', async () => {
  const response = await POST(new Request('https://example.com', { method: 'POST', body: JSON.stringify({ ...body, gender: '' }) }));
  expect(response.status).toBe(400);
  expect(await response.json()).toEqual({ error: 'Gender is required' });
  expect(User).not.toHaveBeenCalled();
  expect(connectDB).not.toHaveBeenCalled();
});
it('prevents a minor from using the independent student journey', async () => {
  const response = await POST(new Request('https://example.com', { method: 'POST', body: JSON.stringify({ ...body, role: 'student', ageGroup: '15-17', adultConfirmed: false, parentalAuthority: undefined }) }));
  expect(response.status).toBe(400);
  expect(connectDB).not.toHaveBeenCalled();
});
