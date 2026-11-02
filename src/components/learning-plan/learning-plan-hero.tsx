import { BookOpen, Sparkles } from 'lucide-react';

export function LearningPlanHero({ name, independent }: { name: string; independent: boolean }) {
  return <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-secondary p-6 text-primary-foreground shadow-sm sm:p-8">
    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" /><div className="absolute -bottom-16 right-24 h-44 w-44 rounded-full bg-white/10" />
    <div className="relative max-w-2xl space-y-4"><div className="flex items-center gap-2 text-sm font-medium text-primary-foreground/80"><Sparkles className="h-4 w-4" /> Learning journey</div><div><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{name ? `Welcome back, ${name}` : 'Your learning plan'}</h1><p className="mt-2 text-sm leading-6 text-primary-foreground/85 sm:text-base">Choose teachers, meet them in one coordinated introduction, then select the best fit for {independent ? 'your learning' : "your child's"} goals.</p></div><div className="flex flex-wrap gap-2 text-xs font-medium"><span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5"><BookOpen className="h-3.5 w-3.5" /> Up to 3 teachers</span><span className="rounded-full bg-white/15 px-3 py-1.5">One 60-minute introduction</span><span className="rounded-full bg-white/15 px-3 py-1.5">Free first lesson</span></div></div>
  </section>;
}
