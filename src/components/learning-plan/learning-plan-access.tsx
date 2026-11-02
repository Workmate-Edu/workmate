import { ShieldAlert } from 'lucide-react';

export function LearningPlanAccessNotice() {
  return <section className="flex gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5" role="status"><ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" /><div><h2 className="font-semibold">Teacher selection is unavailable</h2><p className="mt-1 text-sm text-muted-foreground">Use an active, email-verified parent account with a recorded parent or legal-guardian declaration. Contact support if you believe your account is restricted in error.</p></div></section>;
}
