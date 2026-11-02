'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, GraduationCap, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TeacherShortlist } from '@/components/teacher-shortlist';
import { LearningPlanReview } from '@/components/learning-plan/learning-plan-review';
import { publicShortlist } from '@/lib/teacher-shortlist';
import type { ParentOnboarding } from '@/lib/parent-onboarding';

type LearningPlanWizardProps = { initial: ParentOnboarding; matches?: Record<string, unknown>; ownerId: string; role: string; name: string; independent: boolean; canEdit: boolean };

export function LearningPlanWizard({ initial, matches, ownerId, role, name, independent, canEdit }: LearningPlanWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const tracks = initial.learners.flatMap((learner, learnerIndex) => learner.subjects.map((subject, subjectIndex) => ({ learner, learnerIndex, subject, subjectIndex })));
  const activeTrack = currentStep > 0 ? tracks[currentStep - 1] : undefined;
  const personLabel = independent ? 'learner' : 'child';
  const overviewTitle = independent ? 'Review your learning details' : 'Review your children';
  const totalSteps = tracks.length + 1;
  const learnerCountLabel = `${initial.learners.length} ${initial.learners.length === 1 ? personLabel : `${personLabel}s`}`;
  const activeMatch = activeTrack ? publicShortlist(matches?.[`${activeTrack.learnerIndex}_${activeTrack.subjectIndex}`]) : undefined;
  const hasShortlist = Boolean(activeMatch?.teachers.length);
  const hasIntroductionRequest = Boolean(activeMatch?.coordinatedIntroduction && ['requested', 'confirmed', 'completed'].includes(activeMatch.coordinatedIntroduction.status));
  const canContinue = !activeTrack || role !== 'parent' || (hasShortlist && hasIntroductionRequest);
  const incompleteMessage = !hasShortlist
    ? 'Choose and confirm at least one teacher before continuing.'
    : 'Request an introduction before continuing.';

  return <section className="overflow-hidden rounded-3xl border bg-card shadow-sm">
    <header className="border-b bg-gradient-to-r from-secondary/10 via-background to-background px-5 py-5 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-medium text-secondary">Step {currentStep + 1} of {totalSteps}</p><h2 className="mt-1 text-xl font-bold">{activeTrack ? `Choose a ${activeTrack.subject} teacher` : overviewTitle}</h2><p className="mt-1 text-sm text-muted-foreground">{activeTrack ? `Complete this ${personLabel}'s ${activeTrack.subject} journey before moving to another subject.` : independent ? 'Review your learning details, then choose teachers subject by subject.' : "Review each child's details, then choose teachers subject by subject."}</p></div><span className="w-fit rounded-full bg-background px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">{activeTrack ? activeTrack.subject : learnerCountLabel}</span></div>
      <div className="mt-4 flex gap-1.5" aria-label={`Learning plan step ${currentStep + 1} of ${totalSteps}`}>{Array.from({ length: totalSteps }, (_, index) => <span key={index} className={`h-1.5 flex-1 rounded-full ${index === currentStep ? 'bg-secondary' : index < currentStep ? 'bg-secondary/40' : 'bg-muted'}`} />)}</div>
    </header>
    <div className="p-4 sm:p-6">
      {!activeTrack ? <div className="space-y-5"><div className="grid gap-3 md:grid-cols-2">{initial.learners.map((learner, index) => <article key={learner.learnerId || index} className="rounded-2xl border bg-background p-4"><div className="flex items-start gap-3"><div className="rounded-xl bg-secondary/15 p-2.5 text-secondary"><GraduationCap className="h-5 w-5" /></div><div><h3 className="font-semibold">{learner.name}</h3><p className="mt-1 text-sm text-muted-foreground">{learner.ageGroup} - {learner.level}</p></div></div><div className="mt-4 flex gap-2 text-sm text-muted-foreground"><Target className="mt-0.5 h-4 w-4 shrink-0 text-secondary" /><p>{learner.goals}</p></div><div className="mt-4 flex flex-wrap gap-2">{learner.subjects.map(subject => <span key={subject} className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">{subject}</span>)}</div></article>)}</div><LearningPlanReview initial={initial} independent={independent} name={name} canEdit={canEdit} /></div> : <div className="space-y-4"><div className="rounded-2xl border border-secondary/25 bg-secondary/5 p-4"><p className="font-semibold">{activeTrack.learner.name} - {activeTrack.subject}</p><p className="mt-1 text-sm text-muted-foreground">Select up to three approved teachers, then request one coordinated 60-minute introduction with one to three preferred times.</p></div><TeacherShortlist ownerId={ownerId} role={role} learner={activeTrack.learnerIndex} subjectIndex={activeTrack.subjectIndex} subject={activeTrack.subject} match={activeMatch} /></div>}
    </div>
    <footer className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/20 px-4 py-4 sm:px-6"><Button type="button" variant="outline" disabled={currentStep === 0} onClick={() => setCurrentStep(step => step - 1)}><ChevronLeft className="mr-1 h-4 w-4" />Back</Button><div className="ml-auto flex items-center gap-3">{activeTrack && role === 'parent' && !canContinue && <p role="status" className="text-sm text-muted-foreground">{incompleteMessage}</p>}{currentStep < totalSteps - 1 ? <Button type="button" disabled={!canContinue} onClick={() => setCurrentStep(step => step + 1)}>Next<ChevronRight className="ml-1 h-4 w-4" /></Button> : canContinue ? <span className="text-sm font-medium text-secondary">All subjects reviewed</span> : <Button type="button" disabled>Complete this subject</Button>}</div></footer>
  </section>;
}
