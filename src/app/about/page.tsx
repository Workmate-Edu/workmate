import Link from "next/link"
import {
  BookOpen,
  CheckCircle2,
  Heart,
  Landmark,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sun,
  UserRoundCheck,
  UsersRound,
} from "lucide-react"

import { Button } from "@/components/ui/button"

const safeguardingSteps = [
  {
    icon: UsersRound,
    title: "A guardian-managed journey",
    description:
      "Learners aged 6-16 join through a parent or guardian. Independent registration is reserved for adults, and a child's matching and trial booking stay paused until an administrator records a guardian-verification decision.",
  },
  {
    icon: UserRoundCheck,
    title: "Approved teachers",
    description:
      "Only active, verified teachers appear in discovery. Teachers must accept Workmate's conduct requirements before publishing availability.",
  },
  {
    icon: ShieldCheck,
    title: "Protected lesson access",
    description:
      "Families choose their teacher after introductions. Meeting links are limited to authorised booking participants and must use secure Google Meet or Zoom URLs.",
  },
  {
    icon: ShieldAlert,
    title: "A clear route to raise concerns",
    description:
      "Safeguarding reports enter a restricted queue and receive a reference. An alternative escalation route is available when a concern involves the usual contact or tutor.",
  },
]

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50/70 to-background dark:from-amber-950/20 dark:via-orange-950/10">
      <section className="relative overflow-hidden px-6 py-20 md:py-28">
        <Landmark aria-hidden="true" className="absolute inset-0 h-full w-full scale-125 text-primary opacity-[0.04]" />
        <div
          className="relative container mx-auto max-w-4xl space-y-6 text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
            African roots. Modern learning. Thoughtful care.
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-primary md:text-6xl">
            Come, Gather Under Our Digital Baobab
          </h1>
          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            Workmate brings African languages, STEM and Artificial Intelligence together in live online learning for guardian-managed learners aged 6-16 and independent adults.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Button asChild size="lg"><Link href="/sign-up">Join the learning circle</Link></Button>
            <Button asChild size="lg" variant="outline"><Link href="/safety">Read our safety guidance</Link></Button>
          </div>
        </div>
      </section>

      <section className="px-6 py-14">
        <div className="container mx-auto max-w-5xl space-y-16">
          <StorySection icon={Sun} title="The dawn of our journey" copy="For generations, knowledge has travelled through families and communities. Workmate carries that spirit into a modern learning space, helping children in Africa and across the diaspora connect with culture while building skills for the future." />
          <StorySection icon={Sparkles} title="Our mission" copy="We want every learner to feel rooted, curious and capable. That means making African languages part of a rich education alongside mathematics, science, technology and Artificial Intelligence - with families choosing the teacher who fits each learner and subject." />
          <StorySection icon={BookOpen} title="Learning that begins with trust" copy="Families may meet up to three teachers in free 15-minute introductions for each learner and subject. After those introductions are complete, they choose a teacher and book one free 60-minute class for that learner and subject, with no payment required." />
        </div>
      </section>

      <section className="border-y bg-background/80 px-6 py-16 md:py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <ShieldCheck aria-hidden="true" className="mx-auto h-10 w-10 text-primary" />
            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">Safeguarding is part of the journey</h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Our safeguards are designed around who may join, who can teach, how lessons are accessed and how concerns are raised.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {safeguardingSteps.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="rounded-2xl border bg-card p-6 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <span className="rounded-full bg-primary/10 p-3 text-primary"><Icon aria-hidden="true" className="h-6 w-6" /></span>
                  <div>
                    <h3 className="text-xl font-semibold">{title}</h3>
                    <p className="mt-2 leading-relaxed text-muted-foreground">{description}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
            <div className="flex items-start gap-3">
              <CheckCircle2 aria-hidden="true" className="mt-0.5 h-6 w-6 shrink-0" />
              <p className="leading-relaxed">
                Technology supports these safeguards, but safety is shared. A guardian should know when and where a child&apos;s lesson takes place, and teachers remain responsible for the controls on their external meeting accounts. Workmate does not record lessons through the introduction and free-class journey.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild><Link href="/safety">See the full safeguarding guidance</Link></Button>
            <Button asChild variant="outline"><Link href="/contact">Report a safeguarding concern</Link></Button>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 text-center md:py-20">
        <div className="container mx-auto max-w-3xl">
          <Heart aria-hidden="true" className="mx-auto h-9 w-9 text-primary" />
          <h2 className="mt-4 text-3xl font-bold">Join our circle</h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">Help your learner explore their roots, discover new strengths and grow with a teacher you have chosen.</p>
          <Button asChild className="mt-7" size="lg"><Link href="/pricing">Explore the free offer and pricing</Link></Button>
        </div>
      </section>
    </main>
  )
}

function StorySection({ icon: Icon, title, copy }: { icon: typeof Sun; title: string; copy: string }) {
  return (
    <article
      className="grid gap-5 md:grid-cols-[auto_1fr] md:gap-7"
    >
      <span className="h-fit rounded-full bg-primary/10 p-4 text-primary"><Icon aria-hidden="true" className="h-7 w-7" /></span>
      <div>
        <h2 className="text-2xl font-semibold md:text-3xl">{title}</h2>
        <p className="mt-3 text-lg leading-relaxed text-muted-foreground">{copy}</p>
      </div>
    </article>
  )
}
