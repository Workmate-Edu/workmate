"use client";
import { ageGroupForAge, LEARNING_SUBJECTS, type ParentOnboarding, type LearnerIntake } from '@/lib/parent-onboarding';
import { BrandDropdown } from '@/components/ui/brand-dropdown';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export const blankLearner = (): LearnerIntake => ({ name: '', age: 6, ageGroup: '6-8', level: 'beginner', subjects: [], prioritySubject: 'Mathematics', goals: '' });
export function ChildLearningStep({ value, onChange, disabled, independent = false, showAvailability = independent, hasError = false, learnerErrors = {} }: { independent?: boolean; showAvailability?: boolean; hasError?: boolean; learnerErrors?: Record<number, Record<string, string>>; value: ParentOnboarding; onChange: (value: ParentOnboarding) => void; disabled: boolean }) {
  const update = (index: number, patch: Partial<LearnerIntake>) => onChange({ ...value, learners: value.learners.map((child, i) => i === index ? { ...child, ...patch } : child) });
  const timezone = value.timezone || 'UTC';
  const preferredDays = value.preferredDays || [];
  const preferredTime = value.preferredTime || 'flexible';
  const zones = Array.from(new Set([timezone, ...((Intl as any).supportedValuesOf?.('timeZone') || ['UTC', 'Africa/Lagos', 'Europe/London', 'America/New_York', 'America/Toronto'])]));
  return <div className={cn("space-y-6 rounded-xl border border-transparent", hasError && "border-destructive bg-destructive/5 p-4")}>
    <div className="rounded-xl bg-secondary/5 p-4 text-sm"><h2 className={cn("font-semibold", hasError && "text-destructive")}>{independent ? 'Find the right teacher for you' : 'Find the right teacher for your child'}{hasError ? ' — review required' : ''}</h2><p className="mt-1 text-muted-foreground">Tell us your learning goals. After saving your request, browse teachers for every selected subject and choose up to three teachers for 15-minute introductions in each.</p></div>
    {value.pricingDraft && <p className="text-sm text-secondary">Please add your children information and review the selected subjects below.</p>}
    {value.learners.map((child, index) => {
      const errors = learnerErrors[index] || {};
      const childHasError = Object.keys(errors).length > 0;
      return <fieldset key={child.learnerId || index} disabled={disabled} className={cn("space-y-4 rounded-xl border p-4", childHasError && "border-destructive bg-destructive/5")}>
      <legend className={cn("px-2 font-semibold", childHasError && "text-destructive")}>{independent ? 'Your learning preferences' : `Child ${index + 1}`}</legend>
      <label className={cn("block text-sm", errors.name && "text-destructive")}>First name or nickname<Input value={child.name} maxLength={60} aria-invalid={Boolean(errors.name)} onChange={event => update(index, { name: event.target.value })} className={cn("mt-2", errors.name && "border-destructive focus-visible:ring-destructive")} />{errors.name && <span className="mt-1 block text-sm text-destructive">{errors.name}</span>}</label>
      {!independent && <label className={cn("block text-sm", errors.age && "text-destructive")}>Age (Workmate currently serves children aged 6–16)<Input type="number" min={6} max={16} value={child.age ?? ''} aria-invalid={Boolean(errors.age)} onChange={event => {
        const age = event.target.value ? Number(event.target.value) : undefined;
        update(index, { age, ...(age !== undefined && age >= 6 && age <= 16 ? { ageGroup: ageGroupForAge(age) } : {}) });
      }} className={cn("mt-2", errors.age && "border-destructive focus-visible:ring-destructive")} />{errors.age && <span className="mt-1 block text-sm text-destructive">{errors.age}</span>}</label>}
      <div className={independent ? "grid grid-cols-2 gap-3" : "grid grid-cols-1 gap-3"}>
        {independent && <BrandDropdown label="Age group" value={child.ageGroup} onChange={ageGroup => update(index, { ageGroup: ageGroup as LearnerIntake['ageGroup'] })} options={[{ value: '18+', label: '18+ years' }]} disabled={disabled} />}
        <BrandDropdown label={`Child ${index + 1} learning level`} value={child.level} onChange={level => update(index, { level: level as LearnerIntake['level'] })} options={['beginner', 'developing', 'confident'].map(level => ({ value: level, label: level[0].toUpperCase() + level.slice(1) }))} disabled={disabled} />
      </div>
      <fieldset aria-invalid={Boolean(errors.subjects)} className={cn("rounded-lg border border-transparent p-2", errors.subjects && "border-destructive")}><legend className={cn("mb-2 px-1 text-sm font-medium", errors.subjects && "text-destructive")}>Subjects</legend><div className="flex flex-wrap gap-2">{LEARNING_SUBJECTS.map(subject => <label key={subject} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs ${child.subjects.includes(subject) ? 'border-secondary/40 bg-secondary/10' : ''}`}>
        <input type="checkbox" checked={child.subjects.includes(subject)} onChange={event => {
          const subjects = event.target.checked ? [...child.subjects, subject] : child.subjects.filter(item => item !== subject);
          update(index, { subjects, prioritySubject: subjects.includes(child.prioritySubject) ? child.prioritySubject : subjects[0] || 'Mathematics' });
        }} />{subject}
      </label>)}</div>{errors.subjects && <p className="mt-2 text-sm text-destructive">{errors.subjects}</p>}<p className="mt-2 text-xs text-muted-foreground">Each selected subject has its own teacher introductions and free 60-minute class{independent ? '.' : ' for this child.'}</p></fieldset>
      <label className={cn("block text-sm", errors.goals && "text-destructive")}>What would you like help with?<textarea value={child.goals} maxLength={500} aria-invalid={Boolean(errors.goals)} onChange={event => update(index, { goals: event.target.value })} placeholder="For example, confidence with fractions or speaking Yoruba with family." className={cn("mt-2 min-h-24 w-full rounded-xl border bg-background p-3", errors.goals && "border-destructive focus-visible:ring-destructive")} />{errors.goals && <span className="mt-1 block text-sm text-destructive">{errors.goals}</span>}</label>
      {!independent && value.learners.length > 1 && <Button type="button" variant="ghost" onClick={() => onChange({ ...value, learners: value.learners.filter((_, i) => i !== index) })}>Remove child {index + 1}</Button>}
    </fieldset>})}
    {!independent && value.learners.length < 10 && <Button type="button" variant="outline" disabled={disabled} onClick={() => onChange({ ...value, learners: [...value.learners, blankLearner()] })}>Add another child</Button>}
    <div className={showAvailability ? "space-y-3" : "hidden"}><h3 className="font-semibold">When are you available?</h3>
      <BrandDropdown label="Your timezone" value={timezone} onChange={timezone => onChange({ ...value, timezone })} options={zones.map(zone => ({ value: zone, label: zone.replaceAll('_', ' ') }))} disabled={disabled} />
      <fieldset disabled={disabled}><legend className="mb-2 text-sm">Preferred days</legend><div className="flex flex-wrap gap-2">{(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const).map(day => <label key={day} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"><input type="checkbox" checked={preferredDays.includes(day)} onChange={event => onChange({ ...value, preferredDays: event.target.checked ? [...preferredDays, day] : preferredDays.filter(item => item !== day) })} />{day}</label>)}</div></fieldset>
      <BrandDropdown label="Preferred time of day" value={preferredTime} onChange={preferredTime => onChange({ ...value, preferredTime: preferredTime as NonNullable<ParentOnboarding['preferredTime']> })} options={[{ value: 'morning', label: 'Morning (8am–12pm)' }, { value: 'afternoon', label: 'Afternoon (12pm–5pm)' }, { value: 'evening', label: 'Evening (5pm–8pm)' }, { value: 'flexible', label: 'Flexible' }]} disabled={disabled} />
      <p className="text-xs text-muted-foreground">Times are in your selected timezone. These are preferences, not confirmed bookings.</p>
    </div>
  </div>;
}
