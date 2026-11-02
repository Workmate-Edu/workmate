'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BrandDropdown } from '@/components/ui/brand-dropdown';

const categories = [
  ['support', 'General support'],
  ['safeguarding', 'Safeguarding concern'],
  ['safeguarding-escalation', 'Safeguarding escalation involving the usual contact'],
  ['privacy-access', 'Access my information'],
  ['privacy-correction', 'Correct my information'],
  ['privacy-deletion', 'Delete my information'],
] as const;

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', category: 'support', message: '', website: '' });
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setStatus('');
    try {
      const response = await fetch('/api/support-requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Your request could not be recorded');
      setStatus(`${result.message} Reference: ${result.reference}`);
      setForm(current => ({ ...current, message: '' }));
    } catch (error) { setStatus(error instanceof Error ? error.message : 'Your request could not be recorded'); }
    finally { setBusy(false); }
  }
  return <main className="container mx-auto max-w-4xl px-4 py-16">
    <h1 className="text-4xl font-bold">Support, safeguarding and data requests</h1>
    <p className="mt-4 text-muted-foreground">Use this route for service help, safeguarding concerns, or requests to access, correct or delete personal information. Do not include passwords, payment-card details, identity documents or unnecessary information about a child.</p>
    <div className="mt-8 grid gap-8 md:grid-cols-2">
      <section className="space-y-4 rounded-xl border p-6">
        <h2 className="text-2xl font-semibold">Before you submit</h2>
        <p>Submissions are stored in Workmate’s restricted support queue and are available to authorised administrators. Submission confirms receipt by Workmate, not that an investigation or deletion has been completed.</p>
        <p>If the concern involves the person who would usually receive it, choose the safeguarding-escalation option. Do not send the concern to the tutor involved.</p>
        <p>For immediate danger or suspected crime, contact local emergency services or the appropriate child-protection authority first; this form is not an emergency service.</p>
        <p className="text-sm">Read the <Link className="text-primary underline" href="/privacy">Privacy Policy</Link> and <Link className="text-primary underline" href="/safety">Safety guidance</Link>.</p>
      </section>
      <form onSubmit={submit} className="space-y-4 rounded-xl border p-6" aria-describedby="submission-status">
        <label className="block text-sm">Name<input className="mt-1 w-full rounded-md border bg-background p-3" required maxLength={100} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>
        <label className="block text-sm">Email<input className="mt-1 w-full rounded-md border bg-background p-3" required type="email" maxLength={254} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label>
        <div className="space-y-1">
          <label htmlFor="request-type" className="block text-sm">Request type</label>
          <BrandDropdown
            id="request-type"
            label="Request type"
            value={form.category}
            onChange={category => setForm({ ...form, category })}
            options={categories.map(([value, label]) => ({ value, label }))}
          />
        </div>
        <label className="hidden" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} /></label>
        <label className="block text-sm">Message<textarea className="mt-1 min-h-40 w-full rounded-md border bg-background p-3" required minLength={10} maxLength={5000} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} /></label>
        <Button disabled={busy} type="submit">{busy ? 'Recording…' : 'Submit securely'}</Button>
        {status && <p id="submission-status" role="status" className="text-sm">{status}</p>}
      </form>
    </div>
  </main>;
}
