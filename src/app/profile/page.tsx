import Link from "next/link"
import { redirect } from "next/navigation"
import { getAuthSession } from "@/lib/auth"
import { Button } from "@/components/ui/button"

export default async function ProfilePage() {
  const session = await getAuthSession()
  if (!session?.user) redirect("/sign-in")

  const { role, name, email } = session.user
  if (["parent", "student", "teacher"].includes(role)) {
    redirect(`/dashboard/${role}/profile`)
  }

  return (
    <div className="container max-w-2xl py-12 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Your profile</h1>
        <p className="mt-2 text-muted-foreground">Your Workmate account details.</p>
      </div>
      <dl className="rounded-xl border bg-card p-6 space-y-5">
        <div><dt className="text-sm text-muted-foreground">Name</dt><dd className="mt-1 font-medium">{name || "Not provided"}</dd></div>
        <div><dt className="text-sm text-muted-foreground">Email</dt><dd className="mt-1 break-all">{email || "Not provided"}</dd></div>
        <div><dt className="text-sm text-muted-foreground">Account type</dt><dd className="mt-1 capitalize">{role}</dd></div>
      </dl>
      <Button asChild><Link href="/settings">Account settings</Link></Button>
    </div>
  )
}
