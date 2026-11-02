"use client"

import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

type FormData = z.infer<typeof formSchema>

export function ForgotPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [sentTo, setSentTo] = useState("")
  const [retryAt, setRetryAt] = useState(0)
  const [secondsRemaining, setSecondsRemaining] = useState(0)
  const [sendError, setSendError] = useState("")
  const [resent, setResent] = useState(false)
  const sending = useRef(false)

  useEffect(() => {
    if (!retryAt) return
    const updateCountdown = () => {
      const remaining = Math.max(0, Math.ceil((retryAt - Date.now()) / 1000))
      setSecondsRemaining(remaining)
      if (!remaining) setRetryAt(0)
    }
    updateCountdown()
    const timer = setInterval(updateCountdown, 1000)
    return () => clearInterval(timer)
  }, [retryAt])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  const onSubmit = async (data: FormData) => {
    if (sending.current || Date.now() < retryAt) return
    sending.current = true
    setSendError("")
    try {
      setIsSubmitting(true)
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to send reset email')
      }

      setEmailSent(true)
      setSentTo(data.email)
      setResent(emailSent)
      setSecondsRemaining(30)
      setRetryAt(Date.now() + 30_000)
      toast.success("Reset link sent to your email")
    } catch (error) {
      setSendError("We couldn't send the email. Please try again.")
      toast.error("Failed to send reset email. Please try again.")
    } finally {
      sending.current = false
      setIsSubmitting(false)
    }
  }

  if (emailSent) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
        <p role="status" className="text-sm text-muted-foreground">
          {resent ? "We've sent another reset link to " : "We've sent a password reset link to "}
          <span className="font-medium text-foreground break-all">{sentTo}</span>.
        </p>
        <p className="text-sm text-muted-foreground">
          Open the email and select Reset password. The link expires in 1 hour.
        </p>
        <p className="text-sm text-muted-foreground">
          Didn't receive it? Check your spam or junk folder, or resend the email.
        </p>
        {sendError && <p role="alert" className="text-sm text-destructive">{sendError}</p>}
        <Button
          type="button"
          variant="default"
          className="w-full"
          disabled={isSubmitting || secondsRemaining > 0}
          onClick={() => onSubmit({ email: sentTo })}
        >
          {isSubmitting ? (
            <><Loader2 aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />Sending...</>
          ) : secondsRemaining > 0 ? `Resend in ${secondsRemaining}s` : "Resend reset link"}
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Forgot your password?</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>
      {sendError && <p role="alert" className="text-sm text-destructive">{sendError}</p>}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          "Send Reset Link"
        )}
      </Button>
    </form>
  )
}
