import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { getAuthSession } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string }
}) {
  const session = await getAuthSession()
  if (session?.user) {
    redirect("/dashboard")
  }

  if (!searchParams.token) {
    redirect("/forgot-password")
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Reset Password</h1>
          <p className="text-sm text-muted-foreground">
            Enter your new password below.
          </p>
        </div>
        <ResetPasswordForm token={searchParams.token} />
      </div>
    </div>
  )
}
