import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/user';
import { parentOnboardingSchema } from '@/lib/parent-onboarding';
import { intakePath } from '@/lib/learning-workflow';
import { assignLearnerIdentities } from '@/lib/learner-identity';
import { learningProgress } from '@/lib/learning-progress';
import { publicShortlist } from '@/lib/teacher-shortlist';
import { parentalVerificationAllowsLearning } from '@/lib/legal-consent';

export async function GET() {
  const session = await getAuthSession();
  if (!session?.user) return NextResponse.json({ error: 'Please sign in' }, { status: 401 });
  if (session.user.role !== 'parent') return NextResponse.json({ error: 'Parent account required' }, { status: 403 });

  await connectDB();
  const user: any = await User.findOne({ _id: session.user.id, role: 'parent', emailVerified: true })
    .select('role emailVerified isActive legalAcknowledgements safeguarding parentProfile.onboarding')
    .lean();
  if (!user) return NextResponse.json({ error: 'Verified parent account required' }, { status: 404 });

  const intake = user.parentProfile?.onboarding;
  const parsed = parentOnboardingSchema.safeParse(intake);
  if (!parsed.success) {
    return NextResponse.json({
      title: 'Set up your learning plan',
      description: 'Add your children, subjects and learning goals to start choosing teachers.',
      action: 'Start learning plan',
    });
  }

  const tracks = parsed.data.learners.flatMap((learner, learnerIndex) =>
    learner.subjects.map((subject, subjectIndex) => ({
      learner: learner.name,
      subject,
      progress: learningProgress(publicShortlist(intake.matches?.[`${learnerIndex}_${subjectIndex}`])),
    })),
  );
  const next = [...tracks].sort((a, b) => a.progress.step - b.progress.step)[0];
  const completed = tracks.filter(track => track.progress.step === 5).length;
  const parentCanLearn = parentalVerificationAllowsLearning(user);

  if (!parentCanLearn) {
    return NextResponse.json({
      title: 'Complete account requirements',
      description: 'Teacher selection is available once your parent account is active, email verified and includes the recorded parent or legal-guardian declaration.',
      action: 'Review learning plan',
      completed,
      total: tracks.length,
    });
  }

  if (!next || completed === tracks.length) {
    return NextResponse.json({
      title: 'Review your learning plan',
      description: tracks.length ? 'Your free-class journeys are complete. Review each subject or plan the next stage.' : 'Review your learners and subjects.',
      action: 'View learning plan',
      completed,
      total: tracks.length,
    });
  }

  return NextResponse.json({
    title: next.progress.label,
    description: `${next.learner}: ${next.subject}. ${next.progress.detail}`,
    action: 'Continue learning plan',
    step: next.progress.step,
    completed,
    total: tracks.length,
  });
}

export async function PUT(req: Request) {
  const session = await getAuthSession();
  if (!session?.user) return NextResponse.json({ error: 'Please sign in' }, { status: 401 });
  if (!['parent', 'student'].includes(session.user.role)) return NextResponse.json({ error: 'Learner account required' }, { status: 403 });
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }
  const parsed = parentOnboardingSchema.safeParse(body);
  if (!parsed.success || (session.user.role === 'student' && parsed.data.learners.length !== 1)) return NextResponse.json({ error: 'Check your learner details, subjects and availability' }, { status: 400 });
  if (session.user.role === 'parent' && !parsed.data.learners.every(learner => Number.isInteger(learner.age) && learner.age! >= 6 && learner.age! <= 16)) {
    return NextResponse.json({ error: 'Enter an age from 6 to 16 for each child' }, { status: 400 });
  }
  await connectDB();
  const path = intakePath(session.user.role);
  const owner: any = await User.findOne({ _id: session.user.id, role: session.user.role, emailVerified: true }).select(path).lean();
  if (!owner) return NextResponse.json({ error: 'Verify your email first' }, { status: 409 });
  const previous = session.user.role === 'parent' ? owner.parentProfile?.onboarding : owner.studentProfile?.onboarding;
  const learners = assignLearnerIdentities({
    role: session.user.role as 'parent' | 'student', ownerId: session.user.id,
    learners: parsed.data.learners, previous: previous?.learners,
  });
  // Only unreviewed requests can be edited, preventing races with staff matching.
  const updated = await User.updateOne({ _id: session.user.id, role: session.user.role, emailVerified: true, [path]: previous, [`${path}.matches`]: { $exists: false },
    $or: [{ [path]: { $exists: false } }, { [`${path}.status`]: 'pending' }] },
    { $set: { [path]: { ...parsed.data, learners, status: 'pending', submittedAt: new Date() } } });
  if (!updated.matchedCount) return NextResponse.json({ error: 'Verify your email first. If matching is already underway, contact the team to change your request.' }, { status: 409 });
  return NextResponse.json({ success: true });
}
