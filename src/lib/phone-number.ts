import { z } from 'zod';

const INTERNATIONAL_PHONE_PATTERN = /^\+[1-9]\d{7,14}$/;

export function normalizePhoneNumber(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const compact = value.trim().replace(/[\s().-]/g, '');
  if (!compact) return null;
  return compact.startsWith('00') ? `+${compact.slice(2)}` : compact;
}

export function isValidInternationalPhoneNumber(value: unknown): value is string {
  const normalized = normalizePhoneNumber(value);
  return normalized !== null && INTERNATIONAL_PHONE_PATTERN.test(normalized);
}

export const phoneNumberSchema = z.string()
  .trim()
  .min(1, 'Phone Number is required')
  .transform(value => normalizePhoneNumber(value) || value)
  .refine(isValidInternationalPhoneNumber, 'Phone Number must include a valid country code, for example +2348012345678');
