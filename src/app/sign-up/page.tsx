import Link from "next/link"
import { SignUpForm } from "@/components/auth/sign-up-form"
import { Testimonials } from "@/components/auth/testimonials"
import { cn } from "@/lib/utils"

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen">
      <Testimonials />

      {/* Right Column - Form */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center p-8">
        <Link
          href="/sign-in"
          className={cn(
            "absolute right-4 top-4 md:right-8 md:top-8"
          )}
        >
          Sign in
        </Link>
        
        <SignUpForm />
      </div>
    </div>
  )
}
