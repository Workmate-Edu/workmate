import fs from 'fs';
import path from 'path';
import { renderEmail } from '../src/lib/render-email';

// Uses invented data and never imports the SMTP transport or database.
const output = path.resolve(process.argv[2] || 'docs/email-previews');
fs.mkdirSync(output, { recursive: true });
const logo = `data:image/png;base64,${fs.readFileSync('public/images/logo.png').toString('base64')}`;
const templates = fs.readdirSync('email-templates').filter(file => file.endsWith('.html') && !file.startsWith('base-'));
for (const file of templates) {
  const source = fs.readFileSync(path.join('email-templates', file), 'utf8');
  const values: Record<string, string> = {};
  for (const match of Array.from(source.matchAll(/{{(?:#if )?(\w+)}}/g))) {
    const key = match[1];
    values[key] = /link|url/i.test(key) ? 'https://workmateteam.com/dashboard' : /style/i.test(key) ? 'display:block;' : key.replace(/([A-Z])/g, ' $1');
  }
  Object.assign(values, {
    name: 'Ada', userName: 'Ada', recipientName: 'Ada', parentName: 'Ada',
    teacherName: 'Clement', childName: 'Amara', studentName: 'Amara',
    email: 'ada@example.com', username: 'ada', role: 'parent',
    subject: 'Mathematics', subjects: 'Mathematics, Yoruba', grade: 'Year 5',
    sessionDate: '12 October 2026', sessionTime: '4:00 PM (America/New_York)',
    duration: '60', hours: '1 hour', status: 'Pending', amount: '5.00', currency: 'USD',
    passwordResetLink: 'https://workmateteam.com/reset-password?token=preview-only-not-a-real-token-0123456789abcdefghijklmnopqrstuvwxyz',
    resetLink: 'https://workmateteam.com/reset-password?token=preview-only',
    verificationLink: 'https://workmateteam.com/verify-email?token=preview-only',
    childrenDetails: '', days: '3', daysLabel: 's', endDate: '15 October 2026',
    notificationType: 'Assessment ready', mainMessage: 'Your next learning activity is ready to review.',
  });
  const html = renderEmail(file.replace('.html', ''), values)
    .replace(/src="[^"]*\/images\/logo\.png"/, `src="${logo}"`);
  fs.writeFileSync(path.join(output, file), html);
}
fs.writeFileSync(path.join(output, 'index.html'), `<!DOCTYPE html><html lang="en"><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Workmate email previews</title><body style="font-family:Arial,sans-serif;color:#1E293B;max-width:800px;margin:32px auto;padding:20px;"><h1>Workmate email previews</h1><p>Invented sample data. No emails sent. Links are for visual review only.</p><ul>${templates.map(file => `<li style="margin:12px 0"><a style="color:#7C3AED" href="${file}">${file.replace('.html', '')}</a></li>`).join('')}</ul></body></html>`);
console.log(`Rendered ${templates.length} email previews in ${output}`);
