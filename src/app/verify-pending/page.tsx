"use client"

import { Button } from "@/components/ui/button"
import { Mail, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { useSearchParams } from "next/navigation"

export default function VerifyPendingPage() {
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const searchParams = useSearchParams()
  const email = searchParams.get("email")  // string | null

  // On mount (or email change), read last‐sent time
  useEffect(() => {
    if (!email) return
    const key = `lastVerificationSent_${email}`
    const stored = localStorage.getItem(key)
    if (stored) {
      const secondsSince = Math.floor((Date.now() - parseInt(stored, 10)) / 1000)
      const remaining = 60 - secondsSince
      if (remaining > 0) setCountdown(remaining)
    }
  }, [email])

  // Decrement countdown once per second
  useEffect(() => {
    if (countdown <= 0) return
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [countdown])

  // Resend handler
  const handleResend = async () => {
    if (!email || countdown > 0 || isResending) return

    setIsResending(true)
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to resend")
      localStorage.setItem(`lastVerificationSent_${email}`, Date.now().toString())
      setCountdown(60)
      toast.success("Verification email sent")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to resend")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="container flex h-screen w-screen items-center justify-center">
      <div className="mx-auto w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <Mail className="mx-auto h-12 w-12 text-primary" />
          <h1 className="text-2xl font-semibold">Check your email</h1>
          <p className="text-sm text-muted-foreground px-6">
            {email
              ? <>We sent a link to <span className="font-medium">{email}</span>. Check your inbox.</>
              : <>No email provided.</>
            }
          </p>
        </div>

        <div className="space-y-4">
          <Button
            variant="secondary"
            onClick={handleResend}
            disabled={!email || countdown > 0 || isResending}
          >
            {isResending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
              </>
            ) : countdown > 0 ? (
              `Resend in ${countdown}s`
            ) : (
              "Resend verification email"
            )}
          </Button>

          <Button variant="outline" asChild>
            <Link href="/sign-in">Return to sign in</Link>
          </Button>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Didn’t receive it? Check your spam folder.
            </p>
            {email && (
              <p className="text-sm text-muted-foreground">
                Make sure <span className="font-medium">{email}</span> is correct.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
