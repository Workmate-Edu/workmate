import { SessionPricing } from '@/components/session-pricing';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Lesson pricing | Workmate', description: 'Fixed prices for 60-minute Workmate lessons in USD, GBP, CAD and NGN.' };
export default function PricingPage() {
  return <div className="relative isolate min-h-screen"><div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"><div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" /><div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 bg-[size:200%_200%] motion-safe:animate-gradient" /><div className="absolute inset-0 bg-grid-primary/10 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" /></div><div className="container max-w-6xl px-4 py-16 sm:py-24">
    <header className="mx-auto mb-12 max-w-2xl text-center">
      <p className="mb-3 font-semibold text-secondary">African languages, STEM &amp; AI</p>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl bg-gradient-to-r from-secondary via-primary to-secondary bg-clip-text text-transparent">Simple, Transparent Pricing</h1>
      <p className="mt-5 text-lg text-muted-foreground">Find a teacher who fits you or your child, then continue with 60-minute lessons.</p>
    </header>
    <div className="grid items-start gap-10 md:grid-cols-2"><SessionPricing />
      <section aria-labelledby="trial-heading" className="rounded-xl border border-border/50 bg-card/60 p-6 shadow-sm backdrop-blur-sm">
        <h2 id="trial-heading" className="text-2xl font-bold">Start by finding your teacher</h2>
        <p className="mt-3 text-muted-foreground">For new learners and families, browse teachers for your subject and choose before starting paid lessons.</p>
        <ol className="mt-6 space-y-6">
          <li><h3 className="font-semibold">1. Choose up to three teachers</h3><p className="mt-1 text-muted-foreground">Try a free 15-minute introduction with each of up to three teachers for your chosen subject.</p></li>
          <li><h3 className="font-semibold">2. Choose your teacher</h3><p className="mt-1 text-muted-foreground">Compare teaching styles and choose the right fit for you or your child.</p></li>
          <li><h3 className="font-semibold">3. Enjoy one free lesson</h3><p className="mt-1 text-muted-foreground">Each eligible learner gets one free 60-minute lesson per subject after choosing a teacher. For example, AI and Yoruba each include their own free lesson.</p></li>
        </ol>
        <p className="mt-6 text-sm text-muted-foreground">No payment is required for introductions or the free lesson. After choosing teachers, reserve an available time in Your Learning Plan. Parent-managed child journeys require completed parental verification first.</p>
      </section>
    </div>
    <section className="mt-12 rounded-xl border border-border/50 bg-card/60 p-6 shadow-sm backdrop-blur-sm sm:p-8">
      <h2 className="text-2xl font-semibold">Why choose Workmate?</h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-3">
        <div><h3 className="font-semibold">Personal learning</h3><p className="mt-2 text-sm text-muted-foreground">Choose subjects, goals and a teacher that fit you or your child.</p></div>
        <div><h3 className="font-semibold">Flexible planning</h3><p className="mt-2 text-sm text-muted-foreground">Share your timezone and preferred times. We confirm schedules with your teacher.</p></div>
        <div><h3 className="font-semibold">Try before paying</h3><p className="mt-2 text-sm text-muted-foreground">New learners can meet teachers and take their free lesson before deciding on a paid plan.</p></div>
      </div>
    </section>
    <section className="mt-8 rounded-xl border border-border/50 bg-card/60 p-6 shadow-sm backdrop-blur-sm sm:p-8">
      <h2 className="text-2xl font-semibold">Frequently asked questions</h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div><h3 className="font-semibold">Can I register for myself?</h3><p className="mt-2 text-sm text-muted-foreground">Adults aged 18 or older can choose Student for their own learning. Learners aged 6–16 use a parent or guardian account. Teachers have a separate application.</p></div>
        <div><h3 className="font-semibold">Do I pay to start?</h3><p className="mt-2 text-sm text-muted-foreground">No. Your introductory meetings and one free lesson per learner per subject require no payment.</p></div>
        <div><h3 className="font-semibold">How do plan discounts work?</h3><p className="mt-2 text-sm text-muted-foreground">Weekly plans use the base rate. Monthly covers 4 weeks with 15% off; quarterly covers 12 weeks with 20% off.</p></div>
        <div><h3 className="font-semibold">Does this reserve my lessons?</h3><p className="mt-2 text-sm text-muted-foreground">The calculator gives an estimate. Your teacher and schedule are confirmed before you approve a paid plan.</p></div>
      </div>
    </section>
  </div></div>;
}
