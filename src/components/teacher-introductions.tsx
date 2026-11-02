'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BrandDropdown } from '@/components/ui/brand-dropdown';
type Slot = { _id: string; startTime: string; endTime: string; status: string; kind?: string; learnerName?: string; subject?: string; meetingLink: string };
export function TeacherIntroductions() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [start, setStart] = useState('');
  const [link, setLink] = useState('');
  const [kind, setKind] = useState('introduction');
  const [zone, setZone] = useState('UTC');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const load = async () => {
    const response = await fetch('/api/introductions');
    const result = await response.json(); if (!response.ok) throw new Error(result.error);
    setSlots(result.slots);
  };
  useEffect(() => { setZone(Intl.DateTimeFormat().resolvedOptions().timeZone); load().catch(error => setMessage(error.message)); }, []);
  const save = async (body: unknown, method: string) => {
    setBusy(true); setMessage('');
    try {
      const response = await fetch('/api/introductions', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error);
      await load(); setMessage('Saved.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to save'); } finally { setBusy(false); }
  };
  return <div className="space-y-6">
    <form className="space-y-4 rounded-xl border p-5" onSubmit={event => { event.preventDefault(); if (start) void save({ startTime: new Date(start).toISOString(), meetingLink: link, kind }, 'POST'); }}>
      <h2 className="text-xl font-semibold">Publish a trial slot</h2>
      <p className="text-sm text-muted-foreground">Times are in {zone}. Choose a quarter-hour start within 90 days. Use a real meeting link; only the booked learner and staff can see it. Introductions and the free lesson are unpaid.</p>
      <BrandDropdown label="Slot type" value={kind} onChange={setKind} disabled={busy} options={[{ value: 'introduction', label: '15-minute introduction' }, { value: 'free-lesson', label: '60-minute free lesson' }]} />
      <label className="block text-sm">Start time<Input type="datetime-local" step={900} required value={start} onChange={event => setStart(event.target.value)} disabled={busy} /></label>
      <label className="block text-sm">HTTPS meeting link<Input type="url" required value={link} onChange={event => setLink(event.target.value)} disabled={busy} /></label>
      <Button disabled={busy}>Publish slot</Button>
    </form>
    {message && <p role="status">{message}</p>}
    <h2 className="text-xl font-semibold">Your trial slots</h2>
    {slots.length === 0 && <p>No slots yet.</p>}
    {slots.map(slot => <article key={slot._id} className="space-y-2 rounded-xl border p-4">
      <p className="font-semibold">{new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short', timeZone: zone }).format(new Date(slot.startTime))} ({zone})</p>
      <p>{slot.kind === 'free-lesson' ? 'Free lesson (60 min)' : 'Introduction (15 min)'} | {slot.status}{slot.learnerName ? ` | ${slot.learnerName} | ${slot.subject}` : ''}</p>
      {new Date(slot.startTime).getTime() > Date.now() && ['available', 'booked'].includes(slot.status) && <Button variant="outline" disabled={busy} onClick={() => save({ slotId: slot._id, action: slot.status === 'available' ? 'withdraw' : 'cancel' }, 'PATCH')}>{slot.status === 'available' ? 'Withdraw slot' : 'Cancel booking'}</Button>}
      {slot.status === 'booked' && <><a className="text-secondary underline" href={slot.meetingLink} target="_blank" rel="noopener noreferrer">Open meeting</a><Button className="ml-3" disabled={busy || new Date(slot.endTime).getTime() > Date.now()} onClick={() => save({ slotId: slot._id }, 'PATCH')}>Confirm session completed</Button></>}
    </article>)}
  </div>;
}
