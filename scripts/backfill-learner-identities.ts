import 'dotenv/config';
import { connectDB, disconnectDB } from '../src/lib/mongodb';
import {
  backfillLearnerIdentitiesForOwner,
  findLearnerIdentityBackfillCandidates,
} from '../src/lib/backfill-learner-identities';

async function main() {
  const apply = process.argv.includes('--apply');
  await connectDB();
  const candidates = await findLearnerIdentityBackfillCandidates();

  if (!apply) {
    console.log(`Dry run: found ${candidates.length} parent/student accounts with onboarding learners.`);
    console.log('No records changed. Re-run with --apply to perform the guarded transactional backfill.');
    return;
  }

  const totals = { updated: 0, unchanged: 0, missing: 0 };
  for (const candidate of candidates) {
    const result = await backfillLearnerIdentitiesForOwner(String(candidate._id), candidate.role);
    totals[result] += 1;
  }
  console.log(`Backfill complete: ${totals.updated} updated, ${totals.unchanged} already current, ${totals.missing} missing.`);
}

main()
  .catch(error => {
    console.error('Learner identity backfill failed:', error);
    process.exitCode = 1;
  })
  .finally(() => disconnectDB());
