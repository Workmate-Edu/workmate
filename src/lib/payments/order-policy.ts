import { z } from 'zod';

// Snapshot of the current primary calculator, not the pending relaunch offer.
export const LEGACY_PRICE_VERSION = 'legacy-calculator-797-v2';
const plans = {
  weekly: { weeks: 1, discountPercent: 0 },
  monthly: { weeks: 4, discountPercent: 15 },
  quarterly: { weeks: 12, discountPercent: 20 },
};
const id = z.string().regex(/^[a-f\d]{24}$/i).transform(value => value.toLowerCase());
const item = z.object({
  subject: z.enum(['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English', 'Yoruba', 'Igbo', 'Hausa', 'Swahili', 'Arabic']),
  childId: id.optional(),
  numberOfStudents: z.number().int().min(1).max(10),
  hoursPerSession: z.number().int().min(1).max(4),
  sessionsPerWeek: z.number().int().min(1).max(5),
});
const request = z.object({ plan: z.enum(['weekly', 'monthly', 'quarterly']), subjects: z.array(item).min(1).max(100) });

export function quoteLegacyOrder(input: unknown, owner: { id: string; role: string; childIds: string[] }) {
  const ownerId = id.parse(owner.id);
  if (!['parent', 'student'].includes(owner.role)) throw new Error('Account cannot purchase learning access');
  const parsed = request.parse(input);
  const allowed = new Set([ownerId, ...(owner.role === 'parent' ? owner.childIds.map(value => id.parse(value)) : [])]);
  const seen = new Set<string>();
  const subjects = parsed.subjects.map(subject => {
    const childId = subject.childId || ownerId;
    if (!allowed.has(childId)) throw new Error('Student does not belong to this account');
    const key = `${childId}:${subject.subject}`;
    if (seen.has(key)) throw new Error('Duplicate student and subject');
    seen.add(key);
    return { ...subject, childId };
  });
  const plan = plans[parsed.plan];
  const baseCents = subjects.reduce((sum, s) => sum + 797 * s.numberOfStudents * s.hoursPerSession * s.sessionsPerWeek, 0) * plan.weeks;
  const amountCents = Math.round(baseCents * (100 - plan.discountPercent) / 100);
  return { ownerId, priceVersion: LEGACY_PRICE_VERSION, currency: 'USD' as const, amountCents, plan: parsed.plan, durationDays: plan.weeks * 7, subjects };
}

export type OrderQuote = ReturnType<typeof quoteLegacyOrder>;

export interface ExpectedPayment {
  reference: string;
  amountCents: number;
  currency: string;
}

// Only call with the response from Flutterwave's authenticated verification API.
// Provider metadata never supplies ownership, subjects, duration or price.
export function reconcileVerifiedPayment(expected: ExpectedPayment, result: unknown, requestedTransactionId: string) {
  const provider = z.object({
    status: z.literal('success'),
    data: z.object({
      id: z.union([z.string().regex(/^\d+$/), z.number().int().positive()]),
      status: z.literal('successful'),
      tx_ref: z.string(),
      currency: z.string(),
      amount: z.number().finite().positive(),
    }),
  }).parse(result).data;
  if (!/^\d+$/.test(requestedTransactionId) || String(provider.id) !== requestedTransactionId) throw new Error('Transaction ID mismatch');
  if (provider.tx_ref !== expected.reference) throw new Error('Payment reference mismatch');
  if (provider.currency !== expected.currency) throw new Error('Payment currency mismatch');
  const cents = provider.amount * 100;
  if (Math.abs(cents - Math.round(cents)) > 0.000001 || Math.round(cents) !== expected.amountCents) throw new Error('Payment amount mismatch');
  // Exact amounts only for automatic fulfilment; overpayments need reconciliation.
  return { transactionId: String(provider.id), reference: expected.reference, amountCents: expected.amountCents, currency: expected.currency };
}
