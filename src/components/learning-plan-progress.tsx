import Link from 'next/link';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { learningProgress } from '@/lib/learning-progress';
import { publicShortlist } from '@/lib/teacher-shortlist';
import type { ParentOnboarding } from '@/lib/parent-onboarding';

export function LearningPlanProgress({ learners, matches }: { learners: ParentOnboarding['learners']; matches?: Record<string, unknown> }) {
  return <section aria-label="Learning plan progress" className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><div><h2 className="text-lg font-bold">Keep the momentum going</h2><p className="mt-1 text-sm text-muted-foreground">Pick a subject to continue its journey.</p></div><span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">One journey per subject</span></div><ul className="grid gap-2 sm:grid-cols-2">{learners.flatMap((learner, index) => learner.subjects.map((subject, subjectIndex) => {
    const key = `${index}_${subjectIndex}`;
    const progress = learningProgress(publicShortlist(matches?.[key]));
    const complete = progress.step === 5;
    return <li key={key}><Link href={`#subject-${key}`} className="group flex items-center justify-between gap-3 rounded-xl border bg-background p-3 transition-colors hover:border-secondary hover:bg-secondary/5 focus-visible:outline-secondary"><span className="min-w-0"><span className="block truncate font-medium">{learner.name} · {subject}</span><span className="block truncate text-sm text-muted-foreground">{progress.label}</span></span>{complete ? <CheckCircle2 className="h-5 w-5 shrink-0 text-secondary" /> : <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-secondary">{progress.step}/5 <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>}</Link></li>;
  }))}</ul></section>;
}
