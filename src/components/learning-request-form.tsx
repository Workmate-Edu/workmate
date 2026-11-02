'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChildLearningStep, blankLearner } from '@/components/auth/child-learning-step';
import { parentOnboardingSchema, readPricingDraft, PRICING_DRAFT_KEY, type ParentOnboarding } from '@/lib/parent-onboarding';
import { Button } from '@/components/ui/button';
export function LearningRequestForm({ initial, independent, name }: { initial?: ParentOnboarding; independent: boolean; name: string }) {
  const [value, setValue] = useState<ParentOnboarding>(initial || { learners: [{ ...blankLearner(), name: independent ? name : '', ageGroup: independent ? '18+' : '6-8' }], timezone: 'UTC', preferredDays: [], preferredTime: 'flexible' });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  useEffect(() => {
    if (initial) return;
    const draft = readPricingDraft();
    setValue(previous => ({ ...previous, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC', pricingDraft: draft,
      learners: previous.learners.map(learner => ({ ...learner, subjects: draft?.subjects.map(s => s.subject) || [], prioritySubject: draft?.subjects[0]?.subject || 'Mathematics' })) }));
  }, [initial]);
  return <form className="space-y-6" onSubmit={async event => {
    event.preventDefault();
    const parsed = parentOnboardingSchema.safeParse(value);
    if (!parsed.success) { setMessage(parsed.error.issues[0]?.message || 'Check your details'); return; }
    setBusy(true); setMessage('');
    try {
      const response = await fetch('/api/learning-plan', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(parsed.data) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      try { sessionStorage.removeItem(PRICING_DRAFT_KEY); } catch {}
      setMessage('Learner details saved. Review the learner cards, then choose teachers for each subject.'); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to save your request'); } finally { setBusy(false); }
  }}>
    <ChildLearningStep value={value} onChange={setValue} disabled={busy} independent={independent} />
    {message && <p role="status">{message}</p>}
    <Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save free introduction request'}</Button>
  </form>;
}
