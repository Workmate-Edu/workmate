jest.mock('@/lib/auth', () => ({ getAuthSession: jest.fn() }));
jest.mock('@/lib/mongodb', () => ({ connectDB: jest.fn() }));
jest.mock('@/models/support-request', () => ({ SupportRequest: { create: jest.fn(), find: jest.fn() } }));
import { getAuthSession } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { SupportRequest } from '@/models/support-request';
import { GET, POST } from '@/app/api/support-requests/route';
import { GET as testConnection } from '@/app/api/test-connection/route';
import { POST as testEmail } from '@/app/api/test-email/route';
import { PRIVACY_VERSION, TERMS_VERSION, legalRecord, residenceCountrySchema } from '@/lib/legal-consent';
import { COUNTRY_OPTIONS, RESIDENCE_COUNTRIES } from '@/lib/countries';

const request = (body: unknown) => new Request('http://localhost/api/support-requests', { method: 'POST', body: JSON.stringify(body) });
const valid = { category: 'safeguarding-escalation', name: 'Concerned guardian', email: 'guardian@example.invalid', message: 'Please review this safeguarding concern.', website: '' };
beforeEach(() => { jest.clearAllMocks(); (getAuthSession as jest.Mock).mockResolvedValue(null); });

it('records separate versioned legal choices without treating marketing as required', () => {
  const at = new Date('2026-10-18T12:00:00Z');
  expect(legalRecord({ marketingOptIn: false }, at)).toEqual({
    terms: { version: TERMS_VERSION, acceptedAt: at },
    privacy: { version: PRIVACY_VERSION, acknowledgedAt: at },
    marketing: { optedIn: false, recordedAt: at },
  });
});

it('supports the full ISO residence-country list with renderable flag metadata', () => {
  expect(RESIDENCE_COUNTRIES).toHaveLength(249);
  expect(residenceCountrySchema.safeParse('JP').success).toBe(true);
  expect(COUNTRY_OPTIONS).toContainEqual({ value: 'JP', label: 'Japan', flagCode: 'jp' });
  expect(COUNTRY_OPTIONS).toContainEqual(expect.objectContaining({ value: 'AQ', label: 'Antarctica', flagCode: 'aq', flagImageUrl: expect.stringContaining('emoji-datasource-twitter') }));
  expect(residenceCountrySchema.safeParse('XX').success).toBe(false);
});

it('stores a valid restricted safeguarding escalation and confirms only queue receipt', async () => {
  (SupportRequest.create as jest.Mock).mockResolvedValue({ _id: 'reference-1' });
  const response = await POST(request(valid));
  expect(response.status).toBe(201);
  expect(SupportRequest.create).toHaveBeenCalledWith(expect.objectContaining({ category: 'safeguarding-escalation', restricted: true }));
  expect(await response.json()).toMatchObject({ success: true, reference: 'reference-1', message: expect.stringContaining('recorded') });
});

it('rejects malformed or bot-filled support submissions before connecting', async () => {
  expect((await POST(request({ ...valid, website: 'spam.example' }))).status).toBe(400);
  expect(connectDB).not.toHaveBeenCalled();
});

it('restricts support queue reads to administrators', async () => {
  (getAuthSession as jest.Mock).mockResolvedValue({ user: { role: 'teacher' } });
  expect((await GET()).status).toBe(403);
  expect(connectDB).not.toHaveBeenCalled();
});

it('does not let unauthenticated callers trigger diagnostic database or email actions', async () => {
  expect((await testConnection()).status).toBe(403);
  expect((await testEmail()).status).toBe(403);
  expect(connectDB).not.toHaveBeenCalled();
});
