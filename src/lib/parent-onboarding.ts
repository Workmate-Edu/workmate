import { z } from 'zod';
import { PAYMENT_CURRENCIES } from './payments/relaunch-offer';

export const LEARNING_SUBJECTS = ['English', 'Yoruba', 'Igbo', 'Hausa', 'Swahili', 'Arabic', 'Artificial Intelligence', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science'] as const;
export const pricingDraftSchema = z.object({
  currency: z.enum(PAYMENT_CURRENCIES),
  plan: z.enum(['weekly', 'monthly', 'quarterly']),
  subjects: z.array(z.object({
    subject: z.enum(LEARNING_SUBJECTS), students: z.number().int().min(1).max(10),
    hours: z.number().int().min(1).max(4), sessions: z.number().int().min(1).max(5),
  })).max(12),
});
export const PRICING_DRAFT_KEY = 'workmate.learning-plan.v1';
export type ChildAgeGroup = '6-8' | '9-11' | '12-14' | '15-17';
export function ageGroupForAge(age: number): ChildAgeGroup {
  if (age <= 8) return '6-8';
  if (age <= 11) return '9-11';
  if (age <= 14) return '12-14';
  return '15-17';
}
export const learnerSchema = z.object({
  learnerId: z.string().regex(/^[a-f\d]{24}$/i).optional(),
  name: z.string().trim().min(1, 'First name or nickname is required').max(60, 'First name or nickname must be no more than 60 characters'),
  age: z.number().int().min(6, 'Age must be from 6 to 16').max(16, 'Age must be from 6 to 16').optional(),
  ageGroup: z.enum(['3-5', '6-8', '9-11', '12-14', '15-17', '18+']),
  level: z.enum(['beginner', 'developing', 'confident']),
  subjects: z.array(z.enum(LEARNING_SUBJECTS)).min(1, 'Subjects: select at least one').max(12),
  // Compatibility metadata only. Matching and introductions run for every subject.
  prioritySubject: z.enum(LEARNING_SUBJECTS),
  goals: z.string().trim().min(3, 'What would you like help with? Please enter at least 3 characters').max(500, 'What would you like help with? Please use no more than 500 characters'),
}).refine(value => value.subjects.includes(value.prioritySubject), 'Review the selected subjects')
  .refine(value => value.age === undefined || value.ageGroup === ageGroupForAge(value.age), 'Age group must match the learner age');
export const parentOnboardingSchema = z.object({
  learners: z.array(learnerSchema).min(1).max(10),
  // Availability is not collected during parent intake. Exact appointment times
  // are selected from a shortlisted teacher's published slots instead.
  // These remain optional for compatibility with existing saved intakes.
  timezone: z.string().max(80).refine(value => {
    try { new Intl.DateTimeFormat('en', { timeZone: value }).format(); return value.length > 0; } catch { return false; }
  }, 'Choose a valid timezone').optional(),
  preferredDays: z.array(z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])).max(7).optional(),
  preferredTime: z.enum(['morning', 'afternoon', 'evening', 'flexible']).optional(),
  pricingDraft: pricingDraftSchema.optional(),
});
export type ParentOnboarding = z.infer<typeof parentOnboardingSchema>;
export type LearnerIntake = z.infer<typeof learnerSchema>;
export function readPricingDraft(): z.infer<typeof pricingDraftSchema> | undefined {
  try {
    const parsed = pricingDraftSchema.safeParse(JSON.parse(sessionStorage.getItem(PRICING_DRAFT_KEY) || 'null'));
    return parsed.success ? parsed.data : undefined;
  } catch { return undefined; }
}
