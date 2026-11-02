jest.mock('@/lib/mongodb', () => ({ connectDB: jest.fn() }));
jest.mock('@/models/user', () => ({ User: { findOne: jest.fn() } }));
jest.mock('@/templates/authTemplates', () => ({ generateToken: jest.fn(() => 'preview-reset-token') }));
jest.mock('@/lib/smtp', () => ({ __esModule: true, default: { sendMail: jest.fn(async () => ({ response: 'mock accepted' })) } }));

import { POST } from '@/app/api/auth/forgot-password/route';
import { User } from '@/models/user';
import transporter from '@/lib/smtp';

it('sends the actual forgot-password route through the Workmate template without contacting SMTP', async () => {
  const originalAuthUrl = process.env.NEXTAUTH_URL;
  const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;
  process.env.NEXTAUTH_URL = 'https://workmateteam.com';
  process.env.NEXT_PUBLIC_APP_URL = 'https://workmateteam.com';
  (User.findOne as jest.Mock).mockResolvedValue({ _id: 'test-user', name: 'Ada', email: 'ada@example.com' });
  try {
    const response = await POST(new Request('https://workmateteam.com/api/auth/forgot-password', {
      method: 'POST', body: JSON.stringify({ email: 'ada@example.com' }),
    }));
    expect(response.status).toBe(200);
    expect(transporter.sendMail).toHaveBeenCalledTimes(1);
    const message = (transporter.sendMail as jest.Mock).mock.calls[0][0];
    expect(message.from).toBe('"Workmate Team" <noreply@workmateteam.com>');
    expect(message.subject).toBe('Reset your Workmate password');
    expect(message.html).toContain('https://workmateteam.com/reset-password?token=preview-reset-token');
    expect(message.html).toContain('/images/logo.png');
    expect(message.html).toContain('expires in 1 hour');
    expect(message.html).not.toMatch(/diboruwa|{{/i);
  } finally {
    if (originalAuthUrl === undefined) delete process.env.NEXTAUTH_URL;
    else process.env.NEXTAUTH_URL = originalAuthUrl;
    if (originalAppUrl === undefined) delete process.env.NEXT_PUBLIC_APP_URL;
    else process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
  }
});
