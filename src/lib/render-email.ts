import fs from 'fs';
import path from 'path';
import { baseEmailStyles, emailTheme } from './emailTheme';

// All file-based transactional emails use the same Workmate shell.
// Existing callers may supply HTML fragments (e.g. childrenDetails), so preserve
// their replacement contract. Do not recursively interpolate replacement data.
export function renderEmail(template: string, replacements: Record<string, string> = {}): string {
  if (!/^[a-zA-Z0-9_-]+$/.test(template) || ['base-layout', 'base-styles'].includes(template)) {
    throw new Error('Invalid email template');
  }
  const directory = path.join(process.cwd(), 'email-templates');
  const content = fs.readFileSync(path.join(directory, `${template}.html`), 'utf8');
  const layout = fs.readFileSync(path.join(directory, 'base-layout.html'), 'utf8');
  // Brand assets must be reachable by recipients and email image proxies.
  // Authentication URLs may intentionally point to localhost during development.
  const configuredUrl = process.env.EMAIL_BRAND_URL || 'https://workmateteam.com';
  const baseUrl = new URL(configuredUrl).origin;
  const values: Record<string, string> = {
    ...replacements,
    brandUrl: baseUrl,
    brandLogoUrl: `${baseUrl}/images/logo.png`,
    currentYear: String(new Date().getFullYear()),
    emailStyles: baseEmailStyles,
    brandPrimary: emailTheme.colors.primary,
    brandSecondary: emailTheme.colors.secondary,
    brandText: emailTheme.colors.text,
    brandBackground: emailTheme.colors.background,
    brandBackgroundAccent: emailTheme.colors.backgroundAccent,
    brandBorder: emailTheme.colors.border,
    brandTextMuted: emailTheme.colors.textMuted,
    brandSurface: emailTheme.colors.textLight,
  };
  const document = layout.replace('{{emailContent}}', () => content);
  // Support the simple optional block used by the event invitation.
  const conditional = document.replace(/{{#if (\w+)}}([\s\S]*?){{\/if}}/g,
    (_, key: string, body: string) => values[key] ? body : '');
  return conditional.replace(/{{(\w+)}}/g, (placeholder, key: string) =>
    Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : placeholder);
}
