import { publicShortlist } from '@/lib/teacher-shortlist';
import { TeacherShortlist } from '@/components/teacher-shortlist';
import Link from 'next/link';
import { MatchingProgress } from '@/components/matching-progress';
import { MATCHING_STATES, type MatchingState } from '@/lib/learning-workflow';
import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/user';
import { parentOnboardingSchema } from '@/lib/parent-onboarding';

export default async function MatchingRequestsPage() {
  const session = await getAuthSession();
  if (!session?.user) redirect('/sign-in');
  if (session.user.role !== 'admin') redirect('/dashboard');
  await connectDB();
  const parents = await User.find({ emailVerified: true, $or: [{ role: 'parent', 'parentProfile.onboarding.status': { $in: Object.keys(MATCHING_STATES) } }, { role: 'student', 'studentProfile.onboarding.status': { $in: Object.keys(MATCHING_STATES) } }] })
    .select('name email role parentProfile.onboarding studentProfile.onboarding').sort({ 'parentProfile.onboarding.submittedAt': 1 }).limit(100).lean();
  return <div className="mx-auto max-w-5xl space-y-6 p-6">
    <h1 className="text-3xl font-bold">Teacher matching requests</h1>
    <p className="text-muted-foreground">Verified parents and independent learners requesting introductions (up to 100). Review their goals and update progress. Status updates do not create bookings or send messages.</p>
    <Link href="/dashboard/admin/assessments" className="text-secondary underline">Open assessments and teacher assignment</Link>
    {parents.length === 0 && <p>No verified learning requests are waiting for matching.</p>}
    {parents.map((parent: any) => {
      const stored = parent.role === 'student' ? parent.studentProfile?.onboarding : parent.parentProfile?.onboarding;
      const parsed = parentOnboardingSchema.safeParse(stored);
      if (!parsed.success) return <p key={String(parent._id)}>Intake needs review for {parent.name}.</p>;
      const intake = parsed.data;
      const availability = [intake.timezone, intake.preferredDays?.join(', '), intake.preferredTime].filter(Boolean).join(' · ');
      return <article key={String(parent._id)} className="space-y-4 rounded-xl border bg-card p-6">
        <h2 className="text-xl font-semibold">{parent.name}</h2><p>{parent.email} | {parent.role === 'student' ? 'Independent learner' : 'Parent'}</p>
        {availability && <p>{availability}</p>}
        {intake.pricingDraft && <p>Plan preference: {intake.pricingDraft.plan}, {intake.pricingDraft.currency} (not a paid order)</p>}
        {intake.learners.map((child, index) => <div key={index} className="rounded-lg bg-secondary/5 p-4">
          <h3 className="font-semibold">{child.name} · {child.ageGroup} years · {child.level}</h3>
          <p>Subjects: {child.subjects.join(', ')}</p><p className="whitespace-pre-wrap">Goal: {child.goals}</p>
          {child.subjects.map((subject, subjectIndex) => <TeacherShortlist key={subject} ownerId={String(parent._id)} role={parent.role} learner={index} subjectIndex={subjectIndex} subject={subject} admin match={publicShortlist(stored.matches?.[index + '_' + subjectIndex])} />)}
        </div>)}
        <MatchingProgress id={String(parent._id)} role={parent.role} initialStatus={stored.status as MatchingState} initialNote={stored.teamNote || ''} />
      </article>;
    })}
  </div>;
}
