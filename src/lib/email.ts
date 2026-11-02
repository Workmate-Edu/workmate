import { renderEmail } from './render-email';
import transporter from './smtp';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface EmailPayload {
  to: string;
  subject: string;
  template: string;
  replacements: Record<string, string>;
}

async function sendEmailWithRetry(mailOptions: any, retryCount = 0): Promise<any> {
  try {
    return await transporter.sendMail(mailOptions);
  } catch (error) {
    if (retryCount < MAX_RETRIES - 1) {
      await sleep(RETRY_DELAY);
      return sendEmailWithRetry(mailOptions, retryCount + 1);
    }
    throw error;
  }
}

export default async function sendEmail({ to, subject, template, replacements }: EmailPayload) {
  const html = renderEmail(template, replacements);
  const fromAddress = process.env.ZEPTOMAIL_FROM_ADDRESS || process.env.EMAIL_FROM || 'noreply@workmateteam.com';
  return sendEmailWithRetry({
    from: { name: 'Workmate Team', address: fromAddress },
    to,
    subject,
    html,
    headers: { 'X-Priority': '1', 'X-MSMail-Priority': 'High', Importance: 'high' },
  });
}
