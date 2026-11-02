'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MATCHING_STATES, type MatchingState } from '@/lib/learning-workflow';
import { BrandDropdown } from '@/components/ui/brand-dropdown';
import { Button } from '@/components/ui/button';
export function MatchingProgress({ id, role, initialStatus, initialNote = '' }: { id: string; role: string; initialStatus: MatchingState; initialNote?: string }) {
  const [status, setStatus] = useState(initialStatus);
  const [note, setNote] = useState(initialNote);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  return <form className="space-y-3 border-t pt-4" onSubmit={async event => {
    event.preventDefault(); setBusy(true); setMessage('');
    try {
      const response = await fetch('/api/admin/matching-requests', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, role, from: initialStatus, status, note }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setMessage('Progress saved.'); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to save'); } finally { setBusy(false); }
  }}>
    <BrandDropdown label="Matching status" value={status} onChange={value => setStatus(value as MatchingState)} disabled={busy} options={Object.entries(MATCHING_STATES).map(([value, label]) => ({ value, label }))} />
    <label className="block text-sm">Update visible to the learner or parent<textarea disabled={busy} value={note} onChange={e => setNote(e.target.value)} maxLength={1000} className="mt-2 min-h-24 w-full rounded-xl border bg-background p-3" /></label>
    <Button disabled={busy} type="submit">{busy ? 'Saving…' : 'Save progress'}</Button>
    {message && <p role="status">{message}</p>}
  </form>;
}
