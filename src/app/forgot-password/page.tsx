import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { getAuthSession } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function ForgotPasswordPage() {
  const session = await getAuthSession()
  
  if (session?.user) {
    redirect("/dashboard")
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <ForgotPasswordForm />
      </div>
    </div>
  )
}
