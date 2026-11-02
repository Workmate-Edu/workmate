'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
export type IntroductionBooking = { slotId: string; startTime: string; endTime: string; meetingLink: string };
export function IntroductionBookingPicker({ teacherId, ownerId, role, learner, subjectIndex, booking, admin = false, completed = false, kind = 'introduction' }: {
  kind?: 'introduction' | 'free-lesson'; teacherId: string; ownerId: string; role: string; learner: number; subjectIndex: number; booking?: IntroductionBooking; admin?: boolean; completed?: boolean;
}) {
  const [slots, setSlots] = useState<Array<{ _id: string; startTime: string; endTime: string }> | null>(null);
  const [zone, setZone] = useState('UTC');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [changing, setChanging] = useState(false);
  const router = useRouter();
  useEffect(() => { setZone(Intl.DateTimeFormat().resolvedOptions().timeZone); }, []);
  const format = (date: string) => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short', timeZone: zone }).format(new Date(date));
  const book = async (slotId: string, complete = false, cancel = false) => {
    setBusy(true); setMessage('');
    try {
      const response = await fetch('/api/introductions', { method: complete || cancel || (changing && booking) ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slotId: changing && booking && !complete && !cancel ? booking.slotId : slotId, ownerId, role, learner, subjectIndex, ...(cancel ? { action: 'cancel' } : changing && booking && !complete ? { action: 'reschedule', replacementSlotId: slotId } : {}) }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error);
      setSlots(null); setChanging(false); setMessage(cancel ? 'Booking cancelled.' : complete ? 'Completion recorded.' : 'Booking saved.'); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to save booking'); } finally { setBusy(false); }
  };
  const loadSlots = async () => {
    setBusy(true); setMessage('');
    try {
      const response = await fetch('/api/introductions?teacherId=' + teacherId + '&kind=' + kind);
      const result = await response.json(); if (!response.ok) throw new Error(result.error);
      setSlots(result.slots); setChanging(!!booking);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to load times'); } finally { setBusy(false); }
  };
  return <div className="space-y-2">
    {booking ? <>
      <p className="text-sm">{format(booking.startTime)} – {format(booking.endTime)} ({zone})</p>
      <a href={booking.meetingLink} target="_blank" rel="noopener noreferrer" className="text-secondary underline">{kind === 'free-lesson' ? 'Open free lesson meeting' : 'Open introduction meeting'}</a>
      {admin && !completed && <Button disabled={busy || new Date(booking.endTime).getTime() > Date.now()} variant="outline" onClick={() => book(booking.slotId, true)}>{kind === 'free-lesson' ? 'Confirm ended free class' : 'Confirm ended introduction'}</Button>}
      {!completed && new Date(booking.startTime).getTime() > Date.now() && <div className="flex flex-wrap gap-2"><Button disabled={busy} variant="outline" onClick={loadSlots}>Reschedule</Button><Button disabled={busy} variant="outline" onClick={() => book(booking.slotId, false, true)}>{kind === 'free-lesson' ? 'Cancel free lesson' : 'Cancel introduction'}</Button></div>}
    </> : !completed && <>
      <Button disabled={busy} variant="outline" onClick={loadSlots}>{kind === 'free-lesson' ? 'Choose free lesson time' : 'Choose introduction time'}</Button>
    </>}
      {slots && <><p className="text-xs text-muted-foreground">{kind === 'free-lesson' ? '60-minute' : '15-minute'} slots, shown in {zone}. Selecting a time confirms the booking.</p>
        {slots.length === 0 && <p className="text-sm">No slots published yet. Please check again or contact the team.</p>}
        <div className="flex flex-wrap gap-2">{slots.map(slot => <Button key={slot._id} variant="outline" disabled={busy} onClick={() => book(slot._id)}>{format(slot.startTime)}</Button>)}</div>
      </>}
    {message && <p role="status" className="text-sm">{message}</p>}
  </div>;
}
