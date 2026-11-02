import Link from "next/link"
import { redirect } from "next/navigation"
import { getAuthSession } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { AppearanceSettings } from "@/components/account/appearance-settings"

export default async function SettingsPage() {
  const session = await getAuthSession()
  if (!session?.user) redirect("/sign-in")

  return (
    <div className="container max-w-2xl py-12 space-y-6">
      <div><h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-2 text-muted-foreground">Manage your Workmate account and appearance.</p></div>
      <section className="rounded-xl border bg-card p-6 space-y-4" aria-labelledby="appearance-heading">
        <h2 id="appearance-heading" className="text-lg font-semibold">Appearance</h2>
        <AppearanceSettings />
      </section>
      <section className="rounded-xl border bg-card p-6 space-y-4" aria-labelledby="security-heading">
        <h2 id="security-heading" className="text-lg font-semibold">Password</h2>
        <p className="text-sm text-muted-foreground">If you sign in with a password, you can change it here. If you use Google sign-in, manage your password through Google.</p>
        <Button asChild><Link href="/change-password">Change password</Link></Button>
      </section>
      <Button variant="outline" asChild><Link href="/profile">View your profile</Link></Button>
    </div>
  )
}
