import { Types } from 'mongoose';
import type { LearnerIntake } from '@/lib/parent-onboarding';

type StoredLearner = LearnerIntake & { learnerId: string; studentUserId?: string };

export function assignLearnerIdentities({
  role,
  ownerId,
  learners,
  previous = [],
}: {
  role: 'parent' | 'student';
  ownerId: string;
  learners: LearnerIntake[];
  previous?: Array<Partial<StoredLearner>>;
}): StoredLearner[] {
  const previousById = new Map(previous
    .filter(learner => learner.learnerId && Types.ObjectId.isValid(learner.learnerId))
    .map(learner => [String(learner.learnerId).toLowerCase(), learner]));
  const used = new Set<string>();

  return learners.map((learner, index) => {
    let learnerId: string;
    let prior: Partial<StoredLearner> | undefined;

    if (role === 'student') {
      learnerId = ownerId.toLowerCase();
      prior = previous[0];
    } else {
      const submittedId = learner.learnerId?.toLowerCase();
      prior = submittedId ? previousById.get(submittedId) : undefined;
      // Legacy editable intakes have no IDs. Preserve their current positions once,
      // then all later edits carry the generated identity with the learner.
      prior ||= previous[index]?.learnerId ? undefined : previous[index];
      learnerId = prior?.learnerId?.toLowerCase() || new Types.ObjectId().toHexString();
    }

    if (used.has(learnerId)) throw new Error('Duplicate learner identity');
    used.add(learnerId);
    return {
      ...learner,
      learnerId,
      ...(prior?.studentUserId ? { studentUserId: String(prior.studentUserId) } : {}),
    };
  });
}
