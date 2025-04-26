"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X, RefreshCw, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function VerifyEmailPage({ params }: { params: { token: string }}) {
  const [status, setStatus] = useState<'verifying' | 'success' | 'expired' | 'error'>('verifying')
  const [email, setEmail] = useState<string>('')
  const [isResending, setIsResending] = useState(false)
  const router = useRouter()

  useEffect(() => {
    verifyToken()
  }, [params.token])

  const verifyToken = async () => {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: params.token })
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setEmail(data.email)
        // Redirect after 3 seconds
        setTimeout(() => {
          router.push('/signin')
        }, 3000)
      } else {
        if (data.error === 'Token expired') {
          setStatus('expired')
          setEmail(data.email)
        } else {
          setStatus('error')
        }
      }
    } catch (error) {
      setStatus('error')
    }
  }

  const handleResendVerification = async () => {
    try {
      setIsResending(true)
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (!response.ok) {
        throw new Error('Failed to resend verification')
      }

      toast.success('Verification email sent! Please check your inbox.')
    } catch (error) {
      toast.error('Failed to resend verification email')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="container max-w-md py-16">
      <Card className="p-6">
        <div className="text-center space-y-4">
          {status === 'verifying' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
              <h2 className="text-xl font-semibold">Verifying your email...</h2>
              <p className="text-muted-foreground">Please wait while we verify your email address</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold">Email Verified!</h2>
              <p className="text-muted-foreground">
                Your email has been verified. Redirecting to login...
              </p>
              <Button asChild className="mt-4">
                <Link href="/signin">
                  Continue to Login
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </>
          )}

          {status === 'expired' && (
            <>
              <div className="mx-auto w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <RefreshCw className="h-6 w-6 text-yellow-600" />
              </div>
              <h2 className="text-xl font-semibold">Link Expired</h2>
              <p className="text-muted-foreground">
                This verification link has expired. Need a new one?
              </p>
              <Button 
                onClick={handleResendVerification}
                disabled={isResending}
                className="mt-4"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Resend Verification Email
                  </>
                )}
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <X className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold">Verification Failed</h2>
              <p className="text-muted-foreground">
                Unable to verify your email. Please try again or contact support.
              </p>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/signin">
                  Return to Login
                </Link>
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}
