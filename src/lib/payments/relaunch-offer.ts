import { z } from 'zod';

export const PAYMENT_CURRENCIES = ['USD', 'GBP', 'CAD', 'NGN'] as const;
export type PaymentCurrency = typeof PAYMENT_CURRENCIES[number];

// Fixed selling prices in minor units, without exchange-rate conversion.
export const SESSION_PRICES_MINOR = Object.freeze({ USD: 797, GBP: 690, CAD: 1290, NGN: 1200000 });
export const PRICING_PLANS = {
  weekly: { label: 'Weekly', weeks: 1, discount: 0 },
  monthly: { label: 'Monthly', weeks: 4, discount: 15 },
  quarterly: { label: 'Quarterly', weeks: 12, discount: 20 },
} as const;
export type PricingPlan = keyof typeof PRICING_PLANS;
export function quoteLearningPlan(input: unknown) {
  const request = z.object({
    currency: z.enum(PAYMENT_CURRENCIES),
    plan: z.enum(['weekly', 'monthly', 'quarterly']),
    subjects: z.array(z.object({
      subject: z.string().trim().min(1),
      students: z.number().int().min(1).max(10),
      hours: z.number().int().min(1).max(4),
      sessions: z.number().int().min(1).max(5),
    })).max(100),
  }).parse(input);
  const plan = PRICING_PLANS[request.plan];
  const studentHours = request.subjects.reduce((sum, item) => sum + item.students * item.hours * item.sessions, 0) * plan.weeks;
  const subtotalMinor = studentHours * SESSION_PRICES_MINOR[request.currency];
  const totalMinor = Math.round(subtotalMinor * (100 - plan.discount) / 100);
  return { ...request, studentHours, subtotalMinor, totalMinor, savingsMinor: subtotalMinor - totalMinor };
}
export const RELAUNCH_OFFER = Object.freeze({
  version: 'relaunch-fixed-prices-v4',
  lessonMinutes: 60,
  trialTeachersPerSubject: 3,
  introductionMinutesPerTeacher: 15,
  freeLessonsAfterSelection: 1,
  freeLessonScope: 'learner-subject',
  freeLessonMinutes: 60,
  trialTeacherPayoutMinor: 0,
});

// Paid lessons only. Trial bookings need separate server authorization.
// Snapshot the price/version on the order before initiating payment.
export function quotePaidLessons(input: {
  lessons: Array<{ subject: string; tutorId?: string; durationMinutes: number }>;
  currency: PaymentCurrency;
}) {
  const request = z.object({
    lessons: z.array(z.object({
      subject: z.string().trim().min(1),
      tutorId: z.string().optional(),
      durationMinutes: z.number().int().min(60).max(240).multipleOf(60),
    })).min(1).max(100),
    currency: z.enum(PAYMENT_CURRENCIES),
  }).parse(input);
  const unitAmountMinor = SESSION_PRICES_MINOR[request.currency];
  return {
    offerVersion: RELAUNCH_OFFER.version,
    currency: request.currency,
    lessonMinutes: RELAUNCH_OFFER.lessonMinutes,
    unitAmountMinor,
    amountMinor: request.lessons.reduce((sum, lesson) => sum + unitAmountMinor * lesson.durationMinutes / 60, 0),
    lessons: request.lessons.map(lesson => ({ ...lesson, amountMinor: unitAmountMinor * lesson.durationMinutes / 60 })),
  };
}
