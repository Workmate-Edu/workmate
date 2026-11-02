import Link from 'next/link';

export default function SafetyPage() {
  return <main className="container mx-auto max-w-4xl space-y-8 px-4 py-16">
    <header>
      <h1 className="text-4xl font-bold">Safety and safeguarding</h1>
      <p className="mt-3 text-muted-foreground">How Workmate helps children, guardians, adult learners and teachers learn safely together.</p>
    </header>
    <section>
      <h2 className="text-2xl font-semibold">For children and guardians</h2>
      <ul className="mt-3 list-disc space-y-2 pl-6 text-muted-foreground">
        <li>Children aged 6–16 use a parent- or guardian-managed journey; independent signup is limited to adults.</li>
        <li>Keep communication and bookings in authorised Workmate channels. Do not share home addresses, passwords, financial details or unnecessary personal information.</li>
        <li>A guardian should know when and where a child&apos;s online lesson takes place and review any concern promptly.</li>
        <li>The parent or guardian managing the child&apos;s Workmate account may join an introduction or class and remain present if they choose. Tell the teacher who is attending, and do not share the meeting link with anyone who is not an expected participant.</li>
      </ul>
    </section>
    <section>
      <h2 className="text-2xl font-semibold">Meetings</h2>
      <p className="mt-3 text-muted-foreground">Approved teachers create HTTPS Google Meet or Zoom links. Workmate hides available-slot links and shows a booked link only through authorised booking records. Teachers remain responsible for their external meeting-account controls, including waiting rooms, passcodes and admitting only expected participants. Workmate does not record lessons through this flow.</p>
    </section>
    <section>
      <h2 className="text-2xl font-semibold">Report a concern</h2>
      <p className="mt-3 text-muted-foreground">Use the <Link className="text-primary underline" href="/contact">safeguarding form</Link>. If the concern involves the usual recipient, choose safeguarding escalation and do not send it to the tutor involved. The form is not an emergency service; for immediate danger or suspected crime, contact local emergency services or the relevant child-protection authority.</p>
    </section>
  </main>;
}
