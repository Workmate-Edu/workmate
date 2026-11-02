import fs from 'fs';
import path from 'path';
import { renderEmail } from '@/lib/render-email';

const directory = path.join(process.cwd(), 'email-templates');
const templates = fs.readdirSync(directory).filter(name => name.endsWith('.html') && !name.startsWith('base-'));

describe('Workmate email rendering', () => {
  const originalUrl = process.env.NEXT_PUBLIC_APP_URL;
  const originalBrandUrl = process.env.EMAIL_BRAND_URL;
  beforeAll(() => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://workmateteam.com';
    delete process.env.EMAIL_BRAND_URL;
  });
  afterAll(() => {
    if (originalUrl === undefined) delete process.env.NEXT_PUBLIC_APP_URL;
    else process.env.NEXT_PUBLIC_APP_URL = originalUrl;
    if (originalBrandUrl === undefined) delete process.env.EMAIL_BRAND_URL;
    else process.env.EMAIL_BRAND_URL = originalBrandUrl;
  });

  it('uses the public header/footer logo even when the application runs locally', () => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const authUrl = process.env.NEXTAUTH_URL;
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
    process.env.NEXTAUTH_URL = 'http://localhost:3000';
    try {
      const link = 'http://localhost:3000/reset-password?token=test-only';
      const html = renderEmail('passwordReset', { userName: 'Ada', passwordResetLink: link });
      expect(html).toContain('src="https://workmateteam.com/images/logo.png"');
      expect(html).toContain('href="https://workmateteam.com/contact"');
      expect(html).not.toContain('src="http://localhost');
      expect(html).toContain(`href="${link}"`);
    } finally {
      if (appUrl === undefined) delete process.env.NEXT_PUBLIC_APP_URL;
      else process.env.NEXT_PUBLIC_APP_URL = appUrl;
      if (authUrl === undefined) delete process.env.NEXTAUTH_URL;
      else process.env.NEXTAUTH_URL = authUrl;
    }
  });

  it('supports a separate public brand origin without changing action links', () => {
    process.env.EMAIL_BRAND_URL = 'https://brand.example.com/';
    try {
      const html = renderEmail('passwordReset', { passwordResetLink: 'https://app.example.com/reset-password' });
      expect(html).toContain('src="https://brand.example.com/images/logo.png"');
      expect(html).toContain('href="https://app.example.com/reset-password"');
    } finally {
      delete process.env.EMAIL_BRAND_URL;
    }
  });

  it.each(templates)('renders %s with one branded shell and all supplied data', file => {
    const source = fs.readFileSync(path.join(directory, file), 'utf8');
    const values: Record<string, string> = {};
    for (const match of Array.from(source.matchAll(/{{(?:#if )?(\w+)}}/g))) {
      values[match[1]] = /url|link/i.test(match[1]) ? 'https://workmateteam.com/example' : `Sample ${match[1]}`;
    }
    const html = renderEmail(file.replace('.html', ''), values);
    expect(html.match(/<!DOCTYPE html>/gi)).toHaveLength(1);
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain('https://workmateteam.com/images/logo.png');
    expect(html).toContain('African Languages &amp; STEM Education');
    expect(html).toContain('#F4A300');
    expect(html).toContain('#7C3AED');
    expect(html).toContain(`&copy; ${new Date().getFullYear()} Workmate`);
    expect(html).not.toMatch(/{{|diboruwa|dibo-ruwa|comp_logo|#00a6cf|#00afdb/i);
  });

  it('preserves the reset URL, including dollar sequences and query parameters', () => {
    const url = 'https://workmateteam.com/reset-password?token=abc$&xyz&next=dashboard';
    const html = renderEmail('passwordReset', { userName: 'Ada', passwordResetLink: url });
    expect(html.split(`href="${url}"`)).toHaveLength(3);
    expect(html).toContain('Hello Ada,');
    expect(html).toContain('expires in 1 hour');
    expect(html).not.toContain('24 hours');
  });

  it.each(['parent-signup', 'student-signup', 'teacher-signup', 'signup'])(
    'includes a visible, clickable fallback verification URL in %s',
    template => {
      const url = 'https://workmateteam.com/verify-email?token=abc$&next=dashboard';
      const html = renderEmail(template, { verificationLink: url });

      expect(html).toContain('If the button does not work, copy and paste this link into your browser:');
      expect(html.split(`href="${url}"`)).toHaveLength(3);
      expect(html).toContain(`>${url}</a>`);
      expect(html).not.toContain('{{verificationLink}}');
    }
  );

  it('retains existing HTML-fragment and conditional-style replacements', () => {
    expect(renderEmail('parent-signup', { childrenDetails: '<p>Two children</p>' })).toContain('<p>Two children</p>');
    expect(renderEmail('class-session-teacher', { recurringInfoStyle: 'display:none;' })).toContain('style="display:none;"');
  });

  it('omits the optional meeting button when no link is supplied', () => {
    const html = renderEmail('event-invitation', { eventTitle: 'Parent webinar', startTime: '10:00', endTime: '11:00' });
    expect(html).not.toContain('Join Meeting');
    expect(html).not.toContain('{{');
  });

  it('rejects template paths outside the content directory', () => {
    expect(() => renderEmail('../package')).toThrow('Invalid email template');
    expect(() => renderEmail('base-layout')).toThrow('Invalid email template');
  });
});
