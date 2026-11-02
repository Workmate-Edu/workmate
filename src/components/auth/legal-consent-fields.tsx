import Link from 'next/link';
import { BrandDropdown } from '@/components/ui/brand-dropdown';
import { COUNTRY_OPTIONS } from '@/lib/countries';
import { cn } from '@/lib/utils';

export function ResidenceCountryField({ register, residenceCountry, onResidenceCountryChange, error }: { register: any; residenceCountry: string; onResidenceCountryChange: (value: string) => void; error?: string }) {
  return <div className={cn("space-y-2 rounded-lg border border-transparent p-3", error && "border-destructive bg-destructive/5")}>
    <label className={cn("block text-sm font-medium", error && "text-destructive")} htmlFor="residenceCountry">Country of residence</label>
    <input type="hidden" {...register('residenceCountry')} />
    <BrandDropdown id="residenceCountry" label="Country of residence" value={residenceCountry} onChange={onResidenceCountryChange} options={COUNTRY_OPTIONS} />
    {error && <p className="text-sm text-destructive">{error}</p>}
  </div>;
}

export function LegalConsentFields({ register, errors, role, residenceCountry, onResidenceCountryChange, showResidenceCountry = true }: { register: any; errors?: Record<string, any>; role: 'parent' | 'student' | 'teacher'; residenceCountry: string; onResidenceCountryChange: (value: string) => void; showResidenceCountry?: boolean }) {
  const relevantFields = [showResidenceCountry ? 'residenceCountry' : null, 'termsAccepted', 'privacyAcknowledged', role === 'parent' ? 'parentalAuthority' : role === 'student' ? 'adultConfirmed' : 'teacherConductAccepted'].filter(Boolean) as string[];
  const messages = relevantFields.map(field => errors?.[field]?.message).filter(Boolean) as string[];
  const invalid = (field: string) => Boolean(errors?.[field]);
  const consentClass = (field: string) => cn("flex items-start gap-2 rounded-lg border border-transparent p-2 text-sm", invalid(field) && "border-destructive bg-destructive/5 text-destructive");
  return <fieldset className={cn("space-y-3 rounded-xl border p-4", messages.length > 0 && "border-destructive bg-destructive/5")}>
    <legend className={cn("px-2 font-semibold", messages.length > 0 && "text-destructive")}>Privacy and permissions</legend>
    {showResidenceCountry && <ResidenceCountryField register={register} residenceCountry={residenceCountry} onResidenceCountryChange={onResidenceCountryChange} error={errors?.residenceCountry?.message} />}
    <label className={consentClass('termsAccepted')}><input type="checkbox" className="mt-1" aria-invalid={invalid('termsAccepted')} {...register('termsAccepted')} />
      <span>I accept the <Link className="text-primary underline" href="/terms" target="_blank">Terms of Service</Link>.</span>
    </label>
    <label className={consentClass('privacyAcknowledged')}><input type="checkbox" className="mt-1" aria-invalid={invalid('privacyAcknowledged')} {...register('privacyAcknowledged')} />
      <span>I acknowledge the <Link className="text-primary underline" href="/privacy" target="_blank">Privacy Policy</Link>.</span>
    </label>
    {role === 'parent' && <label className={consentClass('parentalAuthority')}><input type="checkbox" className="mt-1" aria-invalid={invalid('parentalAuthority')} {...register('parentalAuthority')} />
      <span>I confirm that I am the parent or legal guardian of each child listed and authorise Workmate to process their information for tutoring.</span>
    </label>}
    {role === 'student' && <label className={consentClass('adultConfirmed')}><input type="checkbox" className="mt-1" aria-invalid={invalid('adultConfirmed')} {...register('adultConfirmed')} />
      <span>I confirm that I am 18 or older. Learners under 18 must use a parent or guardian account and cannot create an independent account.</span>
    </label>}
    {role === 'teacher' && <label className={consentClass('teacherConductAccepted')}><input type="checkbox" className="mt-1" aria-invalid={invalid('teacherConductAccepted')} {...register('teacherConductAccepted')} />
      <span>I accept the current <Link className="text-primary underline" href="/teacher/guidelines" target="_blank">teacher confidentiality, conduct and online-meeting rules</Link>.</span>
    </label>}
    <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" {...register('marketingOptIn')} />
      <span>Optional: send me product news and offers.</span>
    </label>
    {messages.length > 0 && <ul role="alert" className="list-disc space-y-1 pl-5 text-sm text-destructive">{messages.map(message => <li key={message}>{message}</li>)}</ul>}
  </fieldset>;
}
