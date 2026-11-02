import Link from 'next/link';

export default function StudentWithParentRegistrationPage() {
  return <main className="container max-w-lg py-10">
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <h1 className="text-2xl font-bold">A parent or guardian must register</h1>
      <p className="mt-3 text-muted-foreground">
        Workmate does not currently support independent registration or invitation completion for learners under 18. A parent or legal guardian must create the account and add the learner through the parent journey.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link className="rounded-md bg-primary px-4 py-2 text-primary-foreground" href="/account/register">Parent or guardian registration</Link>
        <Link className="rounded-md border px-4 py-2" href="/contact">Contact support</Link>
      </div>
    </div>
  </main>;
}
