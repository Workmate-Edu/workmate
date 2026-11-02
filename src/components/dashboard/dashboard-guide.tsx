'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Increment when a meaningful dashboard update needs a fresh introduction.
export const DASHBOARD_GUIDE_VERSION = 'teacher-booking-v1';
type Step = { title: string; description: string; href: string; action: string };
function stepsFor(role: string): Step[] {
  if (role === 'parent' || role === 'student') return [
    { title: 'Set up your learning plan', description: role === 'parent' ? 'Add each child, their subjects, learning goals and preferred times. Each child has their own teacher choices for each subject.' : 'Choose your subjects, learning goals and preferred times in Your Learning Plan.', href: '/dashboard/learning-plan', action: 'Open learning plan' },
    { title: 'Meet teachers for each subject', description: 'Browse approved teachers and choose one to three per subject. Confirm your choices, then book a free 15-minute introduction with each teacher.', href: '/dashboard/learning-plan', action: 'Browse teachers' },
    { title: 'Choose your teacher', description: 'After all your chosen introductions are confirmed complete, return to the subject card and choose the teacher you want to continue with.', href: '/dashboard/learning-plan', action: 'View teacher choices' },
    { title: 'Book your free class', description: 'Eligible new learners get one free 60-minute lesson per subject with their selected teacher. Choose an available time to confirm the booking. No payment is required. Changing teachers does not reset the offer.', href: '/dashboard/learning-plan', action: 'Manage free classes' },
    { title: 'Return whenever you need help', description: 'Your Learning Plan holds your introductions, teacher selections and free-class bookings. Use Dashboard guide to reopen these steps at any time.', href: '/dashboard/learning-plan', action: 'View bookings' },
  ];
  if (role === 'teacher') return [
    { title: 'Publish available times', description: 'In Introductions, publish 15-minute introduction slots or 60-minute free-class slots with a valid meeting link.', href: '/dashboard/teacher/introductions', action: 'Open introductions' },
    { title: 'Manage your bookings', description: 'Review booked learners, subjects and times in Introductions. New learners can choose you for an introduction and select you for their free class afterwards. These sessions are unpaid.', href: '/dashboard/teacher/introductions', action: 'View bookings' },
    { title: 'Confirm completed classes', description: 'After a booked session ends, confirm completion. Introduction completion lets the learner choose their teacher; free-class completion records that subject’s offer as used.', href: '/dashboard/teacher/introductions', action: 'Review sessions' },
  ];
  if (role === 'admin') return [
    { title: 'Review learning requests', description: 'Open Teacher Matching to review learner preferences and update matching progress.', href: '/dashboard/admin/matching-requests', action: 'Open teacher matching' },
    { title: 'Help families book', description: 'Use the learner’s subject cards to help arrange introductions and free lessons. The same availability and eligibility rules apply to bookings made by the team.', href: '/dashboard/admin/matching-requests', action: 'Review requests' },
  ];
  return [];
}

export function DashboardGuide({ userId, role }: { userId: string; role: string }) {
  const steps = stepsFor(role);
  const storageKey = `workmate.dashboard-guide.${userId}.${role}.${DASHBOARD_GUIDE_VERSION}`;
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    setStep(0);
    try {
      const saved = localStorage.getItem(storageKey);
      const state = saved ? JSON.parse(saved) : null;
      setSeen(state?.seen === true);
      if (Number.isInteger(state?.step) && state.step >= 0 && state.step < steps.length) setStep(state.step);
      // Offer the guide without interrupting a booking or form with an automatic modal.
    } catch { setSeen(false); }
  }, [storageKey, steps.length]);
  if (!steps.length) return null;
  const persist = (next: number) => {
    setSeen(true);
    try { localStorage.setItem(storageKey, JSON.stringify({ seen: true, step: next })); } catch { /* Still works when browser storage is unavailable. */ }
  };
  const selectStep = (next: number) => { setStep(next); persist(next); };
  const close = () => { persist(step); setOpen(false); };
  const current = steps[step] || steps[0];
  return <>
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-secondary/20 bg-secondary/5 p-4">
      <div>
        <p className="font-semibold">{seen ? 'Need a hand?' : 'New here? Explore your dashboard'}</p>
        <p className="text-sm text-muted-foreground">{seen ? 'Reopen the guide whenever you need it.' : `Explore the latest teacher-booking flow in ${steps.length} short steps.`}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button className="bg-secondary text-white hover:bg-secondary/90" onClick={() => setOpen(true)}>Dashboard guide</Button>
        {!seen && <Button variant="ghost" onClick={() => persist(step)}>Maybe later</Button>}
      </div>
    </div>
    <Dialog open={open} onOpenChange={value => value ? setOpen(true) : close()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Dashboard guide</DialogTitle>
          <DialogDescription>Click a number to explore a step. This guide does not change your bookings.</DialogDescription>
        </DialogHeader>
        <nav aria-label="Guide steps" className="flex flex-wrap gap-2">
          {steps.map((item, index) => <Button key={item.title} size="icon" variant={index === step ? 'secondary' : 'outline'} aria-label={`Step ${index + 1}: ${item.title}`} aria-current={index === step ? 'step' : undefined} onClick={() => selectStep(index)}>{index + 1}</Button>)}
        </nav>
        <div aria-live="polite" aria-atomic="true" className="space-y-3 rounded-xl bg-secondary/5 p-4">
          <p className="text-sm text-muted-foreground">Step {step + 1} of {steps.length}</p>
          <h3 className="text-xl font-semibold">{current.title}</h3>
          <p className="text-sm leading-relaxed">{current.description}</p>
          <Button asChild className="bg-secondary text-white hover:bg-secondary/90"><Link href={current.href} onClick={close}>{current.action}</Link></Button>
        </div>
        <div className="flex flex-wrap justify-between gap-2">
          <Button variant="ghost" onClick={close}>Close guide</Button>
          <div className="flex gap-2">
            <Button variant="outline" disabled={step === 0} onClick={() => selectStep(step - 1)}>Back</Button>
            {step < steps.length - 1 ? <Button onClick={() => selectStep(step + 1)}>Next</Button> : <Button onClick={close}>Finish</Button>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </>;
}
