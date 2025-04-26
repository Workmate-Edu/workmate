import Link from "next/link"
import { UserTypeSelector } from "@/components/auth/user-type-selector"
import { Testimonials } from "@/components/auth/testimonials"
import { cn } from "@/lib/utils"
import { getAuthSession } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function SignUpPage() {
  const session = await getAuthSession()

  if (session?.user) {
    redirect(session.user.role === "admin" ? "/dashboard" : `/dashboard/${session.user.role}`)
  }

  return (
    <div className="flex min-h-screen">
      <Testimonials />
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center p-8">
        <Link
          href="/sign-in"
          className={cn("absolute right-4 top-4 md:right-8 md:top-8")}
        >
          Sign in
        </Link>
        <UserTypeSelector />
      </div>
    </div>
  )
}
