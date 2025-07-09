"use client"

import { Button } from "@/components/ui/button"
import { Mail, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { useSearchParams } from "next/navigation"
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function VerifyPendingPage() {
  const session = await getServerSession(authOptions);

  // Use session directly, do NOT use status
  if (!session?.user) {
    // handle unauthenticated
  }

  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const searchParams = useSearchParams()
  const email = searchParams?.get("email")

  useEffect(() => {
    const storedTime = localStorage.getItem(`lastVerificationSent_${email}`)
    if (storedTime) {
      const diff = 60 - Math.floor((Date.now() - parseInt(storedTime)) / 1000)
      if (diff > 0) {
        setCountdown(diff)
      }
    }
  }, [email])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown(prev => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [countdown])

  const handleResend = async () => {
    if (!email || countdown > 0 || isResending) return
    
    try {
      setIsResending(true)
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error)
      }

      // Store the timestamp and start countdown
      localStorage.setItem(`lastVerificationSent_${email}`, Date.now().toString())
      setCountdown(60)
      toast.success("Verification email sent")

    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to resend verification email")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[360px]">
        <div className="flex flex-col space-y-2 text-center">
          <Mail className="mx-auto h-12 w-12 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">
            Check your email
          </h1>
          <p className="text-sm text-muted-foreground px-6">
            We sent a verification link to <span className="font-medium">{email}</span>. 
            Please check your email and click the link to verify your account.
          </p>
        </div>

        <div className="grid gap-4">
          <Button 
            variant="secondary"
            onClick={handleResend}
            disabled={isResending || countdown > 0}
          >
            {isResending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : countdown > 0 ? (
              `Resend available in ${countdown}s`
            ) : (
              "Resend verification email"
            )}
          </Button>
          
          <Button variant="outline" asChild>
            <Link href="/sign-in">
              Return to sign in
            </Link>
          </Button>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Didn't receive the email? Please check your spam folder.
            </p>
            <p className="text-sm text-muted-foreground">
              Make sure <span className="font-medium">{email}</span> is correct.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
