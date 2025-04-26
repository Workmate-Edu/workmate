"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { FiLoader } from "react-icons/fi"

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [isVerifying, setIsVerifying] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasVerified, setHasVerified] = useState(false)

  // Only recompute token if the searchParams change
  const token = useMemo(() => searchParams.get("token"), [searchParams])

  useEffect(() => {
    if (!token || hasVerified) return

    const verifyEmail = async () => {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${token}`)
        const data = await res.json()

        if (!res.ok) {
          setError(data.error || "Verification failed")
        } else {
          toast.success("Email verified successfully!")
          setHasVerified(true)

          setTimeout(() => {
            router.push("/verify-email/success")
          }, 1500)
        }
      } catch (err) {
        console.error("Verification error:", err)
        setError("Something went wrong while verifying your email")
      } finally {
        setIsVerifying(false)
      }
    }

    verifyEmail()
  }, [token, router, hasVerified])

  return (
    <div className="container max-w-lg mx-auto py-8 px-4">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-semibold">Email Verification</h1>

        {isVerifying ? (
          <div className="flex items-center justify-center gap-2">
            <FiLoader className="h-5 w-5 animate-spin" />
            <p>Verifying your email...</p>
          </div>
        ) : error ? (
          <div className="space-y-4">
            <p className="text-red-500">{error}</p>
            <Button
              variant="outline"
              onClick={() => router.push("/sign-in")}
            >
              Back to Sign In
            </Button>
          </div>
        ) : (
          <p className="text-green-500">Redirecting to success page...</p>
        )}
      </div>
    </div>
  )
}
