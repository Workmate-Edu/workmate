import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Terms of Service | Workmate', description: 'Rules for Workmate accounts, tutoring, meetings and the introductory offer.' };

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => <section><h2 className="text-2xl font-semibold">{title}</h2><div className="mt-3 space-y-3 text-muted-foreground">{children}</div></section>;

export default function TermsPage() {
  return <main className="container mx-auto max-w-4xl space-y-9 px-4 py-16">
    <header><h1 className="text-4xl font-bold">Terms of Service</h1><p className="mt-3 text-muted-foreground">Version 2026-10-18</p></header>
    <Section title="Accounts and eligibility"><p>Independent learner accounts are for adults aged 18 or older. A parent or legal guardian must create and control the journey for a child aged 6–16 and provide accurate authority, age and residence information. Teachers must be adults, provide accurate application information, verify their email, and be approved before using teacher functions. Credentials must not be shared.</p></Section>
    <Section title="Confirmed introductory offer"><p>For each learner and subject, Workmate offers up to three free 15-minute introductions with shortlisted teachers, followed by one free 60-minute class with the selected teacher. No payment is required for these sessions. Changing teacher, reordering subjects or using a subject alias does not create another free class. A teacher selection is not a booking; an available time must still be reserved.</p></Section>
    <Section title="Paid plans"><p>Available plans, currencies and charges are shown on the <Link className="text-primary underline" href="/pricing">Pricing page</Link>. A pricing estimate is not a booking or payment. The price and plan details presented for review at checkout apply to the purchase.</p></Section>
    <Section title="Conduct, safeguarding and meetings"><ul className="list-disc space-y-2 pl-6"><li>Use Workmate only for lawful educational activity and communicate respectfully.</li><li>Do not harass, discriminate, impersonate, solicit a child privately, share credentials, bypass guardian controls or expose another person&apos;s information.</li><li>Teachers must follow the current versioned confidentiality, safeguarding and meeting rules.</li><li>Teachers create Google Meet or Zoom links in their own provider accounts. Workmate restricts stored links in the application but does not control all external-account settings.</li><li>Users must report safety concerns and should contact local emergency or child-protection services where immediate action is needed.</li></ul></Section>
    <Section title="Content, availability and account action"><p>Users keep responsibility for material they submit and must have permission to share it. Workmate may restrict or suspend access to protect users, investigate misuse, meet legal duties or maintain the service. Online services and third-party providers may be unavailable; no uninterrupted-service promise is made.</p></Section>
    <Section title="Privacy and requests"><p>The <Link className="text-primary underline" href="/privacy">Privacy Policy</Link> explains how Workmate handles information. The <Link className="text-primary underline" href="/contact">support route</Link> accepts support, safeguarding and data requests and confirms receipt by Workmate.</p></Section>
  </main>;
}
