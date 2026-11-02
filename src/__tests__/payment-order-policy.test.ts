jest.mock('@/lib/mongodb', () => ({ connectDB: jest.fn() }));
jest.mock('@/models/user', () => ({ User: { findById: jest.fn() } }));
jest.mock('@/models/payment-order', () => ({ PaymentOrder: { create: jest.fn() } }));

import { quoteLegacyOrder, reconcileVerifiedPayment } from '@/lib/payments/order-policy';
import { createLegacyPaymentOrder } from '@/lib/payments/create-order';
import { User } from '@/models/user';
import { PaymentOrder } from '@/models/payment-order';

const ownerId = '111111111111111111111111';
const childId = '222222222222222222222222';
const outsider = '333333333333333333333333';
const owner = { id: ownerId, role: 'parent', childIds: [childId] };
const subject = { subject: 'Mathematics', childId, numberOfStudents: 1, hoursPerSession: 1, sessionsPerWeek: 1 };
const request = { plan: 'weekly', subjects: [subject] };
const expected = { reference: 'WM-test', amountCents: 797, currency: 'USD' };
const verified = { status: 'success', data: { id: 42, status: 'successful', tx_ref: 'WM-test', amount: 7.97, currency: 'USD' } };

beforeEach(() => jest.clearAllMocks());

it.each([['weekly', 797, 7], ['monthly', 2710, 28], ['quarterly', 7651, 84]])('snapshots existing %s calculator pricing', (plan, cents, days) => {
  expect(quoteLegacyOrder({ ...request, plan }, owner)).toMatchObject({ amountCents: cents, durationDays: days, currency: 'USD' });
});

it('ignores client price, ownership and renewal-day overrides', () => {
  const quote = quoteLegacyOrder({ ...request, amount: 0.01, amountCents: 1, ownerId: outsider, currency: 'NGN', daysLeft: 99999 }, owner);
  expect(quote).toMatchObject({ ownerId, amountCents: 797, currency: 'USD', durationDays: 7 });
  expect(quote).not.toHaveProperty('daysLeft');
});

it('rejects another family’s student and duplicate student-subject lines', () => {
  expect(() => quoteLegacyOrder({ ...request, subjects: [{ ...subject, childId: outsider }] }, owner)).toThrow('Student does not belong');
  expect(() => quoteLegacyOrder({ ...request, subjects: [subject, subject] }, owner)).toThrow('Duplicate');
});

it.each([0, -1, 1.5, NaN, Infinity, '1', 11])('rejects invalid student count %s', count => {
  expect(() => quoteLegacyOrder({ ...request, subjects: [{ ...subject, numberOfStudents: count }] }, owner)).toThrow();
});

it('rejects empty orders, unknown plans/subjects, and non-purchasing roles', () => {
  expect(() => quoteLegacyOrder({ ...request, subjects: [] }, owner)).toThrow();
  expect(() => quoteLegacyOrder({ ...request, plan: 'unlimited' }, owner)).toThrow();
  expect(() => quoteLegacyOrder({ ...request, subjects: [{ ...subject, subject: 'invented' }] }, owner)).toThrow();
  expect(() => quoteLegacyOrder(request, { ...owner, role: 'admin' })).toThrow();
});

it('allows independent students to buy only for themselves', () => {
  const student = { ...owner, role: 'student' };
  expect(() => quoteLegacyOrder(request, student)).toThrow();
  expect(quoteLegacyOrder({ ...request, subjects: [{ ...subject, childId: undefined }] }, student).subjects[0].childId).toBe(ownerId);
});

it('accepts a matching verified payment without retaining untrusted metadata', () => {
  const result = reconcileVerifiedPayment(expected, { ...verified, data: { ...verified.data, meta: { userId: outsider, daysLeft: 9999 } } }, '42');
  expect(result).toEqual({ transactionId: '42', ...expected });
  expect(result).not.toHaveProperty('meta');
});

it.each([
  { amount: 0.01 }, { amount: 8 }, { amount: 7.971 }, { currency: 'NGN' },
  { tx_ref: 'another-order' }, { status: 'failed' }, { id: 99 },
])('rejects mismatched provider results: %j', change => {
  expect(() => reconcileVerifiedPayment(expected, { ...verified, data: { ...verified.data, ...change } }, '42')).toThrow();
});

it('persists a quote using database ownership rather than client-provided children', async () => {
  (User.findById as jest.Mock).mockReturnValue({ select: () => ({ lean: async () => ({ role: 'parent', parentProfile: { children: [childId] } }) }) });
  (PaymentOrder.create as jest.Mock).mockImplementation(async value => ({ ...value, _id: 'saved-order' }));
  const order = await createLegacyPaymentOrder(ownerId, { ...request, amount: 1, children: [outsider] });
  expect(order).toMatchObject({ orderId: 'saved-order', amount: 7.97, currency: 'USD' });
  expect(order.reference).toMatch(/^WM-[a-f\d-]{36}$/);
  expect(PaymentOrder.create).toHaveBeenCalledWith(expect.objectContaining({ ownerId, amountCents: 797, subjects: [subject] }));
  await expect(createLegacyPaymentOrder(ownerId, { ...request, subjects: [{ ...subject, childId: outsider }] })).rejects.toThrow();
  expect(PaymentOrder.create).toHaveBeenCalledTimes(1);
});
