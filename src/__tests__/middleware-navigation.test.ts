import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { middleware } from '@/middleware';

jest.mock('next-auth/jwt', () => ({ getToken: jest.fn() }));

const mockedGetToken = getToken as jest.MockedFunction<typeof getToken>;

async function visitLearningPlan(role: string) {
  mockedGetToken.mockResolvedValue({ role } as any);
  return middleware(new NextRequest('http://localhost:3000/dashboard/learning-plan'));
}

beforeEach(() => {
  jest.clearAllMocks();
});

it.each(['parent', 'student'])('allows %s accounts to open the shared learning plan', async role => {
  const response = await visitLearningPlan(role);

  expect(response.headers.get('location')).toBeNull();
});

it('keeps the shared learning plan unavailable to teacher accounts', async () => {
  const response = await visitLearningPlan('teacher');

  expect(response.headers.get('location')).toBe('http://localhost:3000/dashboard/teacher');
});
