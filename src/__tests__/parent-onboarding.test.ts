import { parentOnboardingSchema, pricingDraftSchema } from '@/lib/parent-onboarding';
import { assignLearnerIdentities } from '@/lib/learner-identity';
const intake = parentOnboardingSchema.parse({
  learners: [{ name: 'Ada', ageGroup: '6-8', level: 'beginner', subjects: ['Yoruba', 'Artificial Intelligence'], prioritySubject: 'Yoruba', goals: 'Talk with family and learn AI' }],
  timezone: 'Africa/Lagos', preferredDays: ['Saturday'], preferredTime: 'morning',
});
it('accepts every selected subject for the same child without requiring parent self-learning', () => {
  expect(parentOnboardingSchema.parse(intake).learners[0].prioritySubject).toBe('Yoruba');
  expect(parentOnboardingSchema.parse(intake).learners[0].subjects).toEqual(['Yoruba', 'Artificial Intelligence']);
});
it.each([
  { learners: [] }, { timezone: 'Fake/Zone' },
  { learners: [{ ...intake.learners[0], prioritySubject: 'Physics' }] },
  { learners: [{ ...intake.learners[0], name: '' }] },
])('rejects incomplete or inconsistent intake %j', change => {
  expect(parentOnboardingSchema.safeParse({ ...intake, ...change }).success).toBe(false);
});
it('allows a parent intake without broad availability preferences', () => {
  const { timezone, preferredDays, preferredTime, ...withoutAvailability } = intake;
  expect(parentOnboardingSchema.safeParse(withoutAvailability).success).toBe(true);
});
it('strips client workflow and price overrides', () => {
  const parsed = parentOnboardingSchema.parse({ ...intake, status: 'approved', freeLessons: 99 });
  expect(parsed).not.toHaveProperty('status');
  expect(parsed).not.toHaveProperty('freeLessons');
  expect(pricingDraftSchema.parse({ currency: 'GBP', plan: 'monthly', subjects: [], totalMinor: 1 })).not.toHaveProperty('totalMinor');
});

it('assigns durable learner identities without trusting new client IDs', () => {
  const existingId = '111111111111111111111111';
  const injectedId = '222222222222222222222222';
  const previous = [{ ...intake.learners[0], learnerId: existingId, studentUserId: '333333333333333333333333' }];
  const preserved = assignLearnerIdentities({ role: 'parent', ownerId: 'aaaaaaaaaaaaaaaaaaaaaaaa', learners: [{ ...intake.learners[0], learnerId: existingId }], previous });
  expect(preserved[0]).toMatchObject({ learnerId: existingId, studentUserId: '333333333333333333333333' });
  const replaced = assignLearnerIdentities({ role: 'parent', ownerId: 'aaaaaaaaaaaaaaaaaaaaaaaa', learners: [{ ...intake.learners[0], learnerId: injectedId }], previous });
  expect(replaced[0].learnerId).not.toBe(injectedId);
  expect(replaced[0].learnerId).toMatch(/^[a-f\d]{24}$/);
});

it('uses the account identity for an independent learner', () => {
  const ownerId = 'aaaaaaaaaaaaaaaaaaaaaaaa';
  const learners = assignLearnerIdentities({ role: 'student', ownerId, learners: intake.learners });
  expect(learners[0].learnerId).toBe(ownerId);
});
