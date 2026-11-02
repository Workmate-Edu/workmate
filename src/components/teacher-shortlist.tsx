'use client';
import { useState } from 'react';
import Link from 'next/link';
import { learningProgress } from '@/lib/learning-progress';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, CheckCircle2, PlayCircle } from 'lucide-react';
import { IntroductionBookingPicker } from '@/components/introduction-booking';
import type { Shortlist } from '@/lib/teacher-shortlist';
type Candidate = { id: string; name: string; bio: string; image?: string; introductionVideoUrl?: string; availability: Array<{ day: string; slots: Array<{ startTime: string; endTime: string }> }> };
const feedbackOptions = [
  ['communication', 'Communication'],
  ['teaching-approach', 'Teaching approach'],
  ['learner-comfort', 'Learner comfort'],
  ['subject-fit', 'Subject fit'],
] as const;

function TeacherProfileCard({ teacher, subject, selected, disabled, onSelected }: {
  teacher: Candidate;
  subject: string;
  selected: boolean;
  disabled: boolean;
  onSelected: (checked: boolean) => void;
}) {
  const initials = teacher.name.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase();
  const availability = teacher.availability.flatMap(day => day.slots.map(slot => `${day.day}: ${slot.startTime}–${slot.endTime}`));
  return <article className={`overflow-hidden rounded-2xl border bg-card transition-shadow ${selected ? 'border-primary ring-2 ring-primary/20 shadow-md' : 'hover:shadow-md'}`}>
    <div className="flex gap-4 p-4 sm:p-5">
      <Avatar className="h-16 w-16 shrink-0 border-2 border-background shadow-sm sm:h-20 sm:w-20">
        {teacher.image && <AvatarImage src={teacher.image} alt={`${teacher.name}'s profile`} />}
        <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">{initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div><h5 className="text-base font-semibold">{teacher.name}</h5><p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-secondary"><CheckCircle2 className="h-3.5 w-3.5" />Approved Workmate teacher</p></div>
          <label className="flex cursor-pointer items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-sm font-medium">
            <input type="checkbox" className="h-4 w-4 accent-primary" checked={selected} disabled={disabled} onChange={event => onSelected(event.target.checked)} />
            {selected ? 'Selected' : 'Select'}
          </label>
        </div>
        <Badge variant="secondary" className="mt-3">{subject}</Badge>
        <p className="mt-3 line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{teacher.bio || 'This teacher has not added an introduction yet.'}</p>
      </div>
    </div>
    <div className="flex flex-col gap-3 border-t bg-muted/25 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <p className="flex min-w-0 items-start gap-2 text-xs text-muted-foreground"><CalendarDays className="mt-0.5 h-4 w-4 shrink-0" /><span className="line-clamp-2">{availability.length ? availability.join(' · ') : 'Availability will be confirmed by Workmate.'}</span></p>
      {teacher.introductionVideoUrl && <Button asChild variant="outline" size="sm" className="shrink-0"><a href={teacher.introductionVideoUrl} target="_blank" rel="noreferrer"><PlayCircle className="mr-1.5 h-4 w-4" />Watch introduction</a></Button>}
    </div>
  </article>;
}

function IntroductionFeedback({ teacherId, teacherName, initial, onSave, busy }: {
  teacherId: string;
  teacherName: string;
  initial?: { suggestedFeedback: string[]; comment?: string };
  onSave: (teacherId: string, suggestedFeedback: string[], comment: string) => Promise<void>;
  busy: boolean;
}) {
  const [suggestedFeedback, setSuggestedFeedback] = useState<string[]>(initial?.suggestedFeedback || []);
  const [comment, setComment] = useState(initial?.comment || '');
  return <fieldset className="space-y-2 rounded-md bg-muted/40 p-3">
    <legend className="font-medium">Private introduction feedback</legend>
    <p className="text-xs text-muted-foreground">This helps with your choice and is not shown on the teacher&apos;s public profile or used for ratings.</p>
    <div className="flex flex-wrap gap-x-4 gap-y-2">
      {feedbackOptions.map(([value, label]) => <label key={value} className="text-sm"><input type="checkbox" className="mr-1" checked={suggestedFeedback.includes(value)} disabled={busy} onChange={event => setSuggestedFeedback(current => event.target.checked ? [...current, value] : current.filter(item => item !== value))} />{label}</label>)}
    </div>
    <label className="block text-sm">Notes about {teacherName}<textarea className="mt-1 min-h-20 w-full rounded-md border bg-background p-2" maxLength={1000} value={comment} disabled={busy} onChange={event => setComment(event.target.value)} /></label>
    <Button type="button" variant="outline" size="sm" disabled={busy || (!suggestedFeedback.length && !comment.trim())} onClick={() => onSave(teacherId, suggestedFeedback, comment)}>Save private feedback</Button>
  </fieldset>;
}

function CoordinatedIntroductionRequest({ learner, subjectIndex, requested }: { learner: number; subjectIndex: number; requested?: Shortlist['coordinatedIntroduction'] }) {
  const [requestedStarts, setRequestedStarts] = useState<string[]>(['']);
  const requestedStart = requestedStarts[0];
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  if (requested?.status === 'completed') return <div className="rounded-lg border border-secondary/30 bg-secondary/5 p-4" role="status"><p className="font-medium">Introduction completed.</p><p className="mt-1 text-sm text-muted-foreground">Reference {requested.reference}. You can add private feedback and choose from the teachers who participated.</p></div>;
  if (requested?.status === 'confirmed' && requested.meetingLink) return <div className="rounded-lg border border-secondary/30 bg-secondary/5 p-4" role="status"><p className="font-medium">Introduction confirmed.</p><p className="mt-1 text-sm text-muted-foreground">Reference {requested.reference}. Your 60-minute introduction is confirmed for {new Date(requested.requestedStart).toLocaleString()} ({requested.requestedTimezone}).</p><Button asChild className="mt-3"><a href={requested.meetingLink} target="_blank" rel="noreferrer">Join introduction meeting</a></Button></div>;
  if (requested) return <div className="rounded-lg border border-secondary/30 bg-secondary/5 p-4" role="status"><p className="font-medium">Introduction request submitted successfully.</p><p className="mt-1 text-sm text-muted-foreground">Reference {requested.reference}. Workmate will coordinate the shortlisted teachers and confirm one of your preferred times.</p>{requested.requestedStarts && <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">{requested.requestedStarts.map(start => <li key={start}>{new Date(start).toLocaleString()}</li>)}</ul>}</div>;
  const submit = async () => {
    const values = requestedStarts.filter(Boolean);
    if (!values.length || values.length !== requestedStarts.length || new Set(values).size !== values.length) { setMessage('Choose one to three different meeting times.'); return; }
    setBusy(true); setMessage('');
    try {
      const response = await fetch('/api/coordinated-introductions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ learner, subjectIndex, requestedStarts: values.map(value => new Date(value).toISOString()), requestedTimezone: timezone }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setMessage('Introduction requested — awaiting confirmation.');
      router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to request an introduction'); } finally { setBusy(false); }
  };
  return <div className="space-y-3 rounded-lg border border-secondary/30 bg-secondary/5 p-4">
    <div><h5 className="font-semibold">Choose meeting times</h5><p className="mt-1 text-sm text-muted-foreground">Add one to three preferred 60-minute times. Workmate will confirm one option with the shortlisted teachers.</p></div>
    {requestedStarts.map((value, index) => <div key={index} className="flex items-end gap-2"><label className="block flex-1 text-sm">{index === 0 ? 'First preference' : `Alternative ${index}`}<input className="mt-1 block w-full rounded-md border bg-background p-2" type="datetime-local" step="900" value={value} disabled={busy} onChange={event => setRequestedStarts(current => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} /></label>{requestedStarts.length > 1 && <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => setRequestedStarts(current => current.filter((_, itemIndex) => itemIndex !== index))}>Remove</Button>}</div>)}
    {requestedStarts.length < 3 && <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => setRequestedStarts(current => [...current, ''])}>Add another time</Button>}
    <p className="text-xs text-muted-foreground">Your timezone: {timezone}. This is a request, not a confirmed meeting.</p>
    <Button type="button" disabled={busy || !requestedStart} onClick={submit}>{busy ? 'Submitting…' : 'Request introduction'}</Button>
    {message && <p role="status" className="text-sm">{message}</p>}
  </div>;
}

export function TeacherShortlist({ ownerId, role, learner, subjectIndex, subject, match, admin = false }: {
  ownerId: string; role: string; learner: number; subjectIndex: number; subject: string; match?: Shortlist; admin?: boolean;
}) {
  const [teachers, setTeachers] = useState<Candidate[] | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [savingFeedbackFor, setSavingFeedbackFor] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const progress = learningProgress(match);
  const coordinatedParentIntroduction = role === 'parent';
  const coordinatedCompletion = coordinatedParentIntroduction && match?.coordinatedIntroduction?.status === 'completed';
  const act = async (operation: 'publish' | 'complete-introduction' | 'select', teacherId?: string) => {
    setBusy(true); setMessage('');
    try {
      const response = await fetch('/api/learning-plan/matches', { method: operation === 'publish' ? 'POST' : 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ownerId, role, learner, subjectIndex, action: operation, teacherId, teacherIds: selected }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setMessage(operation === 'select' ? 'Teacher selected. Choose an available time below to book your free 60-minute lesson.' : role === 'parent' ? 'Introduction choices saved. Request one coordinated 60-minute introduction below.' : 'Introduction choices saved. Book a time with each teacher below.');
      router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to save'); } finally { setBusy(false); }
  };
  const saveIntroductionFeedback = async (teacherId: string, suggestedFeedback: string[], comment: string) => {
    setSavingFeedbackFor(teacherId); setMessage('');
    try {
      const response = await fetch('/api/learning-plan/matches', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ownerId, role, learner, subjectIndex, action: 'save-introduction-feedback', teacherId, suggestedFeedback, comment }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setMessage('Private introduction feedback saved.');
      router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to save feedback'); } finally { setSavingFeedbackFor(null); }
  };
  return <section id={`subject-${learner}_${subjectIndex}`} className="mt-4 scroll-mt-20 space-y-3 rounded-xl border bg-card p-4">
    <h4 className="font-semibold">{subject}: teacher introductions</h4>
    <div className="rounded-lg bg-secondary/5 p-3"><p className="font-medium">Step {progress.step} of 5: {progress.label}</p><p className="text-sm text-muted-foreground">{progress.detail}</p></div>
    {match ? <>
      <p className="text-sm text-muted-foreground">{match.selectedTeacherId ? 'Your teacher selection is saved. Your free lesson booking is below.' : coordinatedParentIntroduction ? 'Request one 60-minute introduction meeting with your shortlisted teachers. Workmate will coordinate the meeting and send one invitation.' : `Introductions completed: ${match.completedIntroductions.filter(id => match.teachers.some(t => t.id === id)).length} of ${match.teachers.length}. Each introduction lasts 15 minutes. Book an available time below.`}</p>
      {match.teachers.map(teacher => <div key={teacher.id} className="space-y-3 rounded-xl border bg-card p-4">
        <div className="flex gap-3"><Avatar className="h-12 w-12 border"><AvatarImage src={teacher.image} alt={`${teacher.name}'s profile`} /><AvatarFallback className="bg-primary/10 font-semibold text-primary">{teacher.name.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase()}</AvatarFallback></Avatar><div className="min-w-0"><h5 className="font-semibold">{teacher.name}</h5><p className="text-xs font-medium text-secondary">Approved Workmate teacher</p></div>{teacher.introductionVideoUrl && <Button asChild variant="outline" size="sm" className="ml-auto shrink-0"><a href={teacher.introductionVideoUrl} target="_blank" rel="noreferrer"><PlayCircle className="mr-1 h-4 w-4" />Video</a></Button>}</div>
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">{teacher.bio || 'This teacher has not added an introduction yet.'}</p>
        <p className="text-sm">{match.completedIntroductions.includes(teacher.id) ? 'Introduction completed' : 'Introduction awaiting completion'}</p>
        {match.selectedTeacherId === teacher.id && <p className="font-semibold text-secondary">Your selected teacher</p>}
        {!coordinatedParentIntroduction && <IntroductionBookingPicker teacherId={teacher.id} ownerId={ownerId} role={role} learner={learner} subjectIndex={subjectIndex} booking={match.bookings?.[teacher.id]} admin={admin} completed={match.completedIntroductions.includes(teacher.id)} />}
        {!admin && role === 'parent' && match.completedIntroductions.includes(teacher.id) && <IntroductionFeedback teacherId={teacher.id} teacherName={teacher.name} initial={match.introductionFeedback?.[teacher.id]} onSave={saveIntroductionFeedback} busy={savingFeedbackFor === teacher.id} />}
        {!admin && !match.selectedTeacherId && <Button disabled={busy || (coordinatedCompletion ? !match.completedIntroductions.includes(teacher.id) : !match.teachers.every(t => match.completedIntroductions.includes(t.id)))} onClick={() => act('select', teacher.id)}>Choose {teacher.name}</Button>}
      </div>)}
      {coordinatedParentIntroduction && !match.selectedTeacherId && <CoordinatedIntroductionRequest learner={learner} subjectIndex={subjectIndex} requested={match.coordinatedIntroduction} />}
      {match.selectedTeacherId ? <div className="space-y-3 rounded-xl bg-secondary/5 p-4"><h5 className="font-semibold">Your free 60-minute {subject} lesson</h5><p className="text-sm">{match.freeLesson ? 'Manage your free lesson below. This offer is available once per learner in this subject.' : 'Teacher selection saved; this selection is not a booking. Choose an available time with your selected teacher. No payment is required.'}</p><IntroductionBookingPicker kind="free-lesson" teacherId={match.selectedTeacherId} ownerId={ownerId} role={role} learner={learner} subjectIndex={subjectIndex} booking={match.freeLesson} admin={admin} completed={match.freeLesson?.completed || false} />{match.freeLesson?.completed && <p className="font-semibold">Free lesson completed</p>}</div> : !admin && (coordinatedCompletion || !coordinatedParentIntroduction) && <p className="text-sm text-muted-foreground">{coordinatedCompletion ? 'Your introduction is complete. Choose from the participating teachers above.' : match.teachers.every(t => match.completedIntroductions.includes(t.id)) ? 'Your introductions are complete. Choose the teacher you would like to continue with above.' : 'Choose your teacher after all chosen introductions are confirmed complete by the teachers or our team.'}</p>}
    </> : <>
      <Button disabled={busy} variant="outline" onClick={async () => {
        setBusy(true); setMessage('');
        try {
          const response = await fetch(`/api/learning-plan/matches?subject=${encodeURIComponent(subject)}`);
          const result = await response.json(); if (!response.ok) throw new Error(result.error);
          setTeachers(result.teachers);
        } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to load teachers'); } finally { setBusy(false); }
      }}>Browse teachers</Button>
      {teachers && <>
        <p className="text-sm">{role === 'parent' ? 'Choose up to three teachers for one 60-minute introduction. Confirm your choices, then request a preferred time.' : 'Choose one, two or three teachers for free 15-minute introductions. Confirm your choices, then book an available time with each teacher. Choosing teachers does not reserve a time.'}</p>
        {teachers.length === 0 && <p role="status">No matching teachers are available yet. Contact the team for help.</p>}
        <div className="grid gap-4 xl:grid-cols-2">{teachers.map(teacher => <TeacherProfileCard key={teacher.id} teacher={teacher} subject={subject} selected={selected.includes(teacher.id)} disabled={busy || (!selected.includes(teacher.id) && selected.length === 3)} onSelected={checked => setSelected(current => checked ? [...current, teacher.id] : current.filter(id => id !== teacher.id))} />)}</div>
        <Button disabled={busy || selected.length < 1 || selected.length > 3} onClick={() => act('publish')}>Confirm introduction choices</Button>
      </>}
    </>}
    {match?.freeLesson?.completed && !admin && <div className="space-y-3 rounded-xl border border-secondary/20 p-4">
      <h5 className="font-semibold">Continue learning {subject}</h5>
      <p className="text-sm">Explore weekly, four-week monthly and twelve-week quarterly plans. Reviewing prices does not start a subscription or charge you. Contact the team to arrange your next lessons.</p>
      <div className="flex flex-wrap gap-2"><Button asChild variant="outline"><Link href="/pricing">Review paid plans</Link></Button><Button asChild><Link href="/contact">Discuss next lessons</Link></Button></div>
    </div>}
    {message && <p role="status" className="text-sm">{message}</p>}
  </section>;
}
