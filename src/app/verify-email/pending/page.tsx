"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FiLoader, FiMail } from "react-icons/fi"
import { toast } from "sonner"

export default function PendingVerificationPage() {
  const [isResending, setIsResending] = useState(false)
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  const handleResend = async () => {
    if (!email) {
      toast.error("Email address is missing")
      return
    }

    try {
      setIsResending(true)
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to resend verification email')
      }

      toast.success("Verification email resent successfully!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to resend verification email")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="container max-w-lg mx-auto py-8 px-4">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-primary/10 p-3 rounded-full">
              <FiMail className="w-6 h-6 text-primary" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Check your email</h1>
            <p className="text-muted-foreground">
              We&apos;ve sent you a verification link to:
              <br />
              <span className="font-medium text-foreground">{email}</span>
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button asChild variant="outline">
              <Link href="/sign-in">
                Back to Sign In
              </Link>
            </Button>

            <Button 
              variant="link" 
              onClick={handleResend}
              disabled={isResending}
            >
              {isResending && <FiLoader className="mr-2 h-4 w-4 animate-spin" />}
              Didn&apos;t receive the email? Click to resend
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
