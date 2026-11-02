import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/user';
import { parentOnboardingSchema } from '@/lib/parent-onboarding';
import { MATCHING_STATES, type MatchingState } from '@/lib/learning-workflow';
import { LearningRequestForm } from '@/components/learning-request-form';
import { parentalVerificationAllowsLearning } from '@/lib/legal-consent';
import { LearningPlanHero } from '@/components/learning-plan/learning-plan-hero';
import { LearningPlanAccessNotice } from '@/components/learning-plan/learning-plan-access';
import { LearningPlanWizard } from '@/components/learning-plan/learning-plan-wizard';

export default async function LearningPlanPage() {
  const session = await getAuthSession();
  if (!session?.user) redirect('/sign-in?callbackUrl=/dashboard/learning-plan');
  if (!['parent', 'student'].includes(session.user.role)) redirect('/dashboard');
  await connectDB();
  const user: any = await User.findById(session.user.id).select('name role emailVerified isActive legalAcknowledgements safeguarding parentProfile.onboarding studentProfile.onboarding').lean();
  if (!user) redirect('/sign-in');

  const independent = session.user.role === 'student';
  const intake = independent ? user.studentProfile?.onboarding : user.parentProfile?.onboarding;
  const parsed = parentOnboardingSchema.safeParse(intake);
  const status = intake?.status as MatchingState | undefined;
  const parentCanLearn = independent || parentalVerificationAllowsLearning(user);
  const needsPlan = !intake;

  return <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
    <LearningPlanHero name={user.name || ''} independent={independent} />
    {!user.emailVerified ? <p role="alert" className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">Verify your email before submitting your request.</p> : <>
      {needsPlan ? <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6"><div className="mb-5"><h2 className="text-xl font-bold">{status && MATCHING_STATES[status] || 'Start a learning plan'}</h2><p className="mt-1 text-sm text-muted-foreground">{independent ? 'Add your subjects and learning goals. You can choose teachers next.' : "Add each child's subjects and goals. You can choose teachers next."}</p></div><LearningRequestForm initial={parsed.success ? parsed.data : undefined} independent={independent} name={user.name || ''} /></section> : <>
        {intake?.teamNote && <section className="rounded-2xl border border-secondary/25 bg-secondary/5 p-4 text-sm"><span className="font-semibold">Workmate update</span><p className="mt-1 whitespace-pre-wrap text-muted-foreground">{intake.teamNote}</p></section>}
        {!parentCanLearn && <LearningPlanAccessNotice />}
        {parentCanLearn && parsed.success && <LearningPlanWizard initial={parsed.data} matches={intake.matches} ownerId={session.user.id} role={session.user.role} name={user.name || ''} independent={independent} canEdit={!intake.matches} />}
      </>}
    </>}
  </div>;
}
