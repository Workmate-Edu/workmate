import Link from "next/link"
import {SignInForm} from "@/components/auth/sign-in-form"
import { Testimonials } from "@/components/auth/testimonials"
import { cn } from "@/lib/utils"
import { getAuthSession } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function SignInPage() {
  const session = await getAuthSession()

  if (session?.user) {
    const dashboardPath = session.user.role === 'admin' 
      ? '/dashboard' 
      : `/dashboard/${session.user.role}`
    redirect(dashboardPath)
  }

  return (
    <div className="flex min-h-screen">
      <Testimonials />

      {/* Right Column - Form */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center p-8">
        <Link
          href="/sign-up"
          className={cn(
            "absolute right-4 top-4 md:right-8 md:top-8"
          )}
        >
          Sign up
        </Link>
        
        <SignInForm />
      </div>
    </div>
  )
}
