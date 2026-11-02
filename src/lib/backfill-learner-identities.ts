import mongoose, { Types } from 'mongoose';
import { User } from '@/models/user';
import { assignLearnerIdentities } from '@/lib/learner-identity';

type LearningRole = 'parent' | 'student';

export type LearnerIdentityBackfillResult = 'updated' | 'unchanged' | 'missing';

function onboardingPath(role: LearningRole) {
  return role === 'parent' ? 'parentProfile.onboarding' : 'studentProfile.onboarding';
}

function identitiesAreCurrent(role: LearningRole, ownerId: string, learners: any[]) {
  const ids = learners.map(learner => String(learner?.learnerId || '').toLowerCase());
  if (ids.some(id => !Types.ObjectId.isValid(id)) || new Set(ids).size !== ids.length) return false;
  return role === 'parent' || (learners.length === 1 && ids[0] === ownerId.toLowerCase());
}

/**
 * Adds durable learner IDs without changing any other intake data. The exact
 * stored intake is included in the update filter so a concurrent workflow
 * change aborts instead of being overwritten.
 */
export async function backfillLearnerIdentitiesForOwner(
  ownerId: string,
  role: LearningRole,
): Promise<LearnerIdentityBackfillResult> {
  const transaction = await mongoose.startSession();
  let result: LearnerIdentityBackfillResult = 'missing';

  try {
    await transaction.withTransaction(async () => {
      const path = onboardingPath(role);
      const owner: any = await User.findOne({ _id: ownerId, role }).select(path).session(transaction).lean();
      const intake = role === 'parent' ? owner?.parentProfile?.onboarding : owner?.studentProfile?.onboarding;
      if (!owner || !Array.isArray(intake?.learners) || intake.learners.length === 0) return;

      if (identitiesAreCurrent(role, ownerId, intake.learners)) {
        result = 'unchanged';
        return;
      }

      const learners = assignLearnerIdentities({
        role,
        ownerId,
        learners: intake.learners,
        previous: intake.learners,
      });
      const updated = await User.updateOne(
        { _id: ownerId, role, [path]: intake },
        { $set: { [`${path}.learners`]: learners } },
        { session: transaction },
      );
      if (updated.matchedCount !== 1) throw new Error(`Onboarding intake changed during learner identity backfill for ${ownerId}`);
      result = 'updated';
    });
    return result;
  } finally {
    await transaction.endSession();
  }
}

export async function findLearnerIdentityBackfillCandidates() {
  return User.find({
    role: { $in: ['parent', 'student'] },
    $or: [
      { 'parentProfile.onboarding.learners.0': { $exists: true } },
      { 'studentProfile.onboarding.learners.0': { $exists: true } },
    ],
  }).select({ _id: 1, role: 1 }).lean<Array<{ _id: Types.ObjectId; role: LearningRole }>>();
}
