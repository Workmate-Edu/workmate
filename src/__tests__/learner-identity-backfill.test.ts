import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { User } from '@/models/user';
import { backfillLearnerIdentitiesForOwner } from '@/lib/backfill-learner-identities';

jest.setTimeout(120000);
let replica: MongoMemoryReplSet;

const learner = (name: string) => ({
  name,
  ageGroup: '6-8',
  level: 'beginner',
  subjects: ['Yoruba'],
  prioritySubject: 'Yoruba',
  goals: 'Speak with family',
});

beforeAll(async () => {
  replica = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const uri = replica.getUri('workmate_learner_identity_backfill_tests');
  if (!uri.includes('127.0.0.1')) throw new Error('Tests must use an isolated local database');
  await mongoose.connect(uri);
  await User.init();
});

afterAll(async () => {
  await mongoose.disconnect();
  if (replica) await replica.stop();
});

beforeEach(() => User.deleteMany({}));

it('backfills a locked parent intake while preserving its exact workflow state', async () => {
  const ownerId = new mongoose.Types.ObjectId();
  const intake = {
    status: 'contacting',
    learners: [learner('Ada'), learner('Tobi')],
    matches: { '0_0': { subject: 'Yoruba', selectedTeacherId: 'teacher-1' } },
    freeLessonClaims: { '0_0': { status: 'reserved' } },
    teamNote: 'Keep this note',
  };
  await User.collection.insertOne({ _id: ownerId, email: 'parent@example.invalid', username: 'parent_backfill', role: 'parent', parentProfile: { onboarding: intake } });

  await expect(backfillLearnerIdentitiesForOwner(String(ownerId), 'parent')).resolves.toBe('updated');
  const stored: any = await User.findById(ownerId).lean();
  expect(stored.parentProfile.onboarding).toMatchObject({
    status: intake.status,
    matches: intake.matches,
    freeLessonClaims: intake.freeLessonClaims,
    teamNote: intake.teamNote,
  });
  expect(stored.parentProfile.onboarding.learners.map((item: any) => item.learnerId)).toEqual([
    expect.stringMatching(/^[a-f\d]{24}$/),
    expect.stringMatching(/^[a-f\d]{24}$/),
  ]);
  expect(new Set(stored.parentProfile.onboarding.learners.map((item: any) => item.learnerId)).size).toBe(2);
});

it('uses the account ID for an independent learner and is idempotent', async () => {
  const ownerId = new mongoose.Types.ObjectId();
  await User.collection.insertOne({ _id: ownerId, email: 'student@example.invalid', username: 'student_backfill', role: 'student', studentProfile: { onboarding: { status: 'reviewing', learners: [learner('Sam')] } } });

  await expect(backfillLearnerIdentitiesForOwner(String(ownerId), 'student')).resolves.toBe('updated');
  await expect(backfillLearnerIdentitiesForOwner(String(ownerId), 'student')).resolves.toBe('unchanged');
  const stored: any = await User.findById(ownerId).lean();
  expect(stored.studentProfile.onboarding.learners[0].learnerId).toBe(String(ownerId));
});

it('does not modify an account without onboarding learners', async () => {
  const ownerId = new mongoose.Types.ObjectId();
  await User.collection.insertOne({ _id: ownerId, email: 'empty@example.invalid', username: 'empty_backfill', role: 'parent' });
  await expect(backfillLearnerIdentitiesForOwner(String(ownerId), 'parent')).resolves.toBe('missing');
});
