"use client"

import { Button } from "@/components/ui/button"
import { XCircle } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

const errorMessages = {
  missing_token: "The verification link is missing or invalid.",
  invalid_token: "This verification link has expired or is invalid.",
  invalid_user: "We couldn't find your account. Please try signing up again.",
  already_verified: "Your email is already verified. You can sign in.",
  server_error: "Something went wrong. Please try again or contact support.",
} as const

export default function VerifyErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams?.get("error") as keyof typeof errorMessages || "server_error"
  const email = searchParams?.get("email")

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[360px]">
        <div className="flex flex-col space-y-2 text-center">
          <XCircle className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="text-2xl font-semibold tracking-tight">
            Verification Failed
          </h1>
          <p className="text-sm text-muted-foreground px-6">
            {errorMessages[error]}
          </p>
        </div>

        <div className="grid gap-4">
          <Button variant="default" asChild>
            <Link href="/sign-in">
              Back to Sign In
            </Link>
          </Button>
          
          {email && (
            <Button 
              variant="outline" 
              asChild
            >
              <Link href={`/verify-pending?email=${encodeURIComponent(email)}`}>
                Resend Verification Email
              </Link>
            </Button>
          )}

          <p className="text-center text-sm text-muted-foreground">
            Need help? <Link href="/contact" className="underline">Contact support</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
