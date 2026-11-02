"use client";
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { LoadingLinkButton } from '@/components/ui/loading-link-button';
import { PAYMENT_CURRENCIES, SESSION_PRICES_MINOR, type PaymentCurrency, PRICING_PLANS, quoteLearningPlan, type PricingPlan } from '@/lib/payments/relaunch-offer';
import { BrandDropdown } from '@/components/ui/brand-dropdown';
import { PRICING_DRAFT_KEY, readPricingDraft } from '@/lib/parent-onboarding';
const labels = { USD: 'US dollars', GBP: 'British pounds', CAD: 'Canadian dollars', NGN: 'Nigerian naira' };
const symbols = { USD: 'US$', GBP: '\u00a3', CAD: 'CA$', NGN: '\u20a6' };
const subjectGroups = {
  Languages: ['English', 'Yoruba', 'Igbo', 'Hausa', 'Swahili', 'Arabic'],
  'STEM & AI': ['Artificial Intelligence', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science'],
};
export function SessionPricing() {
  const { data: session } = useSession();
  const learningAccount = session?.user?.role === 'parent' || session?.user?.role === 'student';
  const [currency, setCurrency] = useState<PaymentCurrency>('USD');
  const [subjects, setSubjects] = useState<Record<string, { students: number; hours: number; sessions: number }>>({});
  const [plan, setPlan] = useState<PricingPlan>('weekly');
  useEffect(() => {
    const draft = readPricingDraft();
    if (draft) { setCurrency(draft.currency); setPlan(draft.plan); setSubjects(Object.fromEntries(draft.subjects.map(({ subject, ...config }) => [subject, config]))); }
  }, []);
  const saveDraft = () => {
    try { sessionStorage.setItem(PRICING_DRAFT_KEY, JSON.stringify({ currency, plan, subjects: Object.entries(subjects).map(([subject, config]) => ({ subject, ...config })) })); } catch {}
  };
  const quote = quoteLearningPlan({ currency, plan, subjects: Object.entries(subjects).map(([subject, config]) => ({ subject, ...config })) });
  const format = (minor: number) => symbols[currency] + (minor / 100).toLocaleString('en-US', { minimumFractionDigits: currency === 'NGN' ? 0 : 2, maximumFractionDigits: 2 });
  const price = (SESSION_PRICES_MINOR[currency] / 100).toLocaleString('en-US', { minimumFractionDigits: currency === 'NGN' ? 0 : 2, maximumFractionDigits: 2 });
  return <section aria-labelledby="session-price-heading" className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-6 shadow-sm sm:p-8">
    <h2 id="session-price-heading" className="text-2xl font-bold">Calculate your learning plan</h2>
    <p className="mt-2 text-sm text-muted-foreground">Customize subjects, student numbers, session length and frequency for yourself or your family.</p>
    <label htmlFor="pricing-currency" className="mb-2 mt-6 block text-sm font-medium">Select your currency</label>
    <BrandDropdown id="pricing-currency" label="Select your currency" value={currency} onChange={value => setCurrency(value as PaymentCurrency)} options={PAYMENT_CURRENCIES.map(code => ({ value: code, label: code + ' - ' + labels[code] }))} />
    <div className="mt-6 grid gap-6 sm:grid-cols-2">
      {Object.entries(subjectGroups).map(([group, names]) => <fieldset key={group}>
        <legend className="mb-3 font-semibold">{group}</legend>
        <div className="space-y-3">{names.map(subject => <label key={subject} className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={subject in subjects} onChange={event => setSubjects(previous => {
            const next = { ...previous };
            if (event.target.checked) next[subject] = { students: 1, hours: 1, sessions: 1 };
            else delete next[subject];
            return next;
          })} className="h-4 w-4 accent-purple-600" />{subject}
        </label>)}</div>
      </fieldset>)}
    </div>
    <div className="mt-6 space-y-4">{Object.entries(subjects).map(([subject, config]) => <fieldset key={subject} className="rounded-lg border p-4">
      <legend className="px-1 font-semibold">{subject}</legend>
      <div className="grid grid-cols-3 gap-3">{([
        ['students', 'Students', 10], ['hours', 'Hours/session', 4], ['sessions', 'Sessions/week', 5],
      ] as const).map(([field, label, max]) => <label key={field} className="text-xs sm:text-sm">
        <span className="mb-2 block">{label}</span><BrandDropdown label={subject + ' ' + label} value={String(config[field])} onChange={value => setSubjects(previous => ({ ...previous, [subject]: { ...previous[subject], [field]: Number(value) } }))} options={Array.from({ length: max }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))} />
      </label>)}</div>
    </fieldset>)}</div>
    <p className="mt-3 text-xs text-muted-foreground">Sessions default to one hour. Choose more hours for longer lessons, subject to teacher availability.</p>
    <fieldset className="mt-6"><legend className="mb-3 font-semibold">Select plan</legend>
      <div className="grid gap-2 sm:grid-cols-3">{(Object.keys(PRICING_PLANS) as PricingPlan[]).map(key => <label key={key} className={`cursor-pointer rounded-lg border p-3 text-sm ${plan === key ? 'border-secondary bg-secondary/10' : ''}`}>
        <input type="radio" name="pricing-plan" value={key} checked={plan === key} onChange={() => setPlan(key)} className="mr-2" />{PRICING_PLANS[key].label}
        <span className="mt-1 block text-xs">{PRICING_PLANS[key].weeks} {key === 'weekly' ? 'week' : 'weeks'}</span>
        {PRICING_PLANS[key].discount > 0 && <span className="mt-1 block font-semibold text-secondary">{PRICING_PLANS[key].discount}% off</span>}
      </label>)}</div>
    </fieldset>
    <p aria-live="polite" aria-atomic="true" className="mt-8 text-4xl font-bold text-secondary">{symbols[currency]}{price}</p>
    <p className="mt-2 text-muted-foreground">base rate per student per hour</p>
    <p className="mt-4 text-sm text-muted-foreground">Fixed prices in your chosen currency.</p>
    <div role="status" className="mt-6 rounded-lg bg-secondary/5 p-4">
      <p>Subtotal: {format(quote.subtotalMinor)}</p>
      {PRICING_PLANS[plan].discount > 0 && <p>Savings ({PRICING_PLANS[plan].discount}%): {format(quote.savingsMinor)}</p>}
      <p className="mt-2 text-lg font-semibold">{PRICING_PLANS[plan].label} total: {format(quote.totalMinor)}</p>
      <p className="mt-1 text-sm text-muted-foreground">{quote.studentHours} student-hours over {PRICING_PLANS[plan].weeks} {plan === 'weekly' ? 'week' : 'weeks'}.</p>
    </div>
    <p className="mt-3 text-xs text-muted-foreground">This is a planning estimate, not a booking or recurring payment. Free introductions and the free lesson are separate. Teacher availability is confirmed before scheduling.</p>
    <LoadingLinkButton size="lg" className="mt-8 w-full" href={learningAccount ? '/dashboard/learning-plan' : session?.user ? '/dashboard' : '/sign-up'} onNavigate={saveDraft} loadingText="Loading...">{learningAccount ? 'Continue your learning plan' : session?.user ? 'Go to dashboard' : 'Get started for free'}</LoadingLinkButton>
  </section>;
}
