import { isValidInternationalPhoneNumber, normalizePhoneNumber, phoneNumberSchema } from '@/lib/phone-number';

it.each([
  ['+2348012345678', '+2348012345678'],
  ['00442079460018', '+442079460018'],
  ['+1 (202) 555-0123', '+12025550123'],
])('normalizes and accepts an international phone number %s', (value, expected) => {
  expect(normalizePhoneNumber(value)).toBe(expected);
  expect(phoneNumberSchema.parse(value)).toBe(expected);
  expect(isValidInternationalPhoneNumber(value)).toBe(true);
});

it.each([
  '',
  '+234',
  '08012345678',
  '+0123456789',
  '+23480CALLME',
  '+1234567890123456',
])('rejects an invalid international phone number %s', value => {
  expect(phoneNumberSchema.safeParse(value).success).toBe(false);
  expect(isValidInternationalPhoneNumber(value)).toBe(false);
});
