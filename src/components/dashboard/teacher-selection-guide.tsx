import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function TeacherSelectionGuide({ independent = false }: { independent?: boolean }) {
  return <section aria-label="Choose your teachers" className="space-y-4 rounded-2xl border border-secondary/20 bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-6">
    <div>
      <h2 className="text-xl font-semibold">Choose your teachers and book your free classes</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {independent ? 'Manage each subject in your learning plan.' : 'Manage teacher choices for each child and subject in your learning plan.'}
        {' '}Eligible new learners receive one free 60-minute class in each subject. No payment is required to start.
      </p>
    </div>
    <ol className="grid gap-3 text-sm sm:grid-cols-3">
      <li className="rounded-xl border bg-background/80 p-3"><strong className="block">1. Browse teachers</strong>Save your subjects, then choose up to three teachers per subject.</li>
      <li className="rounded-xl border bg-background/80 p-3"><strong className="block">2. Meet your shortlist</strong>Book a 15-minute introduction with each chosen teacher.</li>
      <li className="rounded-xl border bg-background/80 p-3"><strong className="block">3. Choose and book</strong>After your introductions are confirmed complete, choose one teacher and book your free 60-minute class.</li>
    </ol>
    <Button asChild className="bg-secondary text-white hover:bg-secondary/90">
      <Link href="/dashboard/learning-plan">Choose teachers / manage introductions</Link>
    </Button>
  </section>;
}
