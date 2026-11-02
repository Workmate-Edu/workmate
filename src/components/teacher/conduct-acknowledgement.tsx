'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function ConductAcknowledgement() {
  const [accepted, setAccepted] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  async function save() {
    setBusy(true); setMessage('');
    try {
      const response = await fetch('/api/teacher/conduct-acknowledgement', { method: 'POST' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to save acknowledgement');
      setMessage('Acknowledgement recorded. You can now create eligible meeting slots.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to save acknowledgement'); }
    finally { setBusy(false); }
  }
  return <div className="rounded-xl border p-5">
    <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={accepted} onChange={event => setAccepted(event.target.checked)} className="mt-1" /><span>I have read and agree to follow these confidentiality, safeguarding, conduct and meeting rules.</span></label>
    <Button className="mt-4" type="button" disabled={!accepted || busy} onClick={save}>{busy ? 'Saving…' : 'Record acknowledgement'}</Button>
    {message && <p className="mt-3 text-sm" role="status">{message}</p>}
  </div>;
}
