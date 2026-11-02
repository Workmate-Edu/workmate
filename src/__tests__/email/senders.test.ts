jest.mock('@/lib/smtp', () => ({
  __esModule: true,
  default: { sendMail: jest.fn(async () => ({ response: 'mock accepted', messageId: 'mock' })) },
}));

import sendSmtpMail from '@/lib/sendSmtpMail';
import sendEmail from '@/lib/email';
import transporter from '@/lib/smtp';
import { renderEmail } from '@/lib/render-email';

describe('shared branding at the email delivery boundary', () => {
  it.each([
    ['standard sender', sendSmtpMail],
    ['retry sender', sendEmail],
  ] as const)('%s delivers the shared rendered layout', async (_, send) => {
    (transporter.sendMail as jest.Mock).mockClear();
    const replacements = { userName: 'Ada', passwordResetLink: 'https://example.com/reset?token=sample' };
    await send({ to: 'ada@example.com', subject: 'Reset your Workmate password', template: 'passwordReset', replacements });
    expect(transporter.sendMail).toHaveBeenCalledTimes(1);
    const message = (transporter.sendMail as jest.Mock).mock.calls[0][0];
    expect(message.html).toBe(renderEmail('passwordReset', replacements));
    expect(JSON.stringify(message.from)).toContain('Workmate Team');
    expect(message.to).toBe('ada@example.com');
  });
});
