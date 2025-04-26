"use client"

import * as React from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Mail, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { useAuthStore } from "@/store/auth-store"
import type { AuthError, UserRole } from "@/types/auth"
import { getSession } from "next-auth/react"

const formSchema = z.object({
  emailOrUsername: z.string().min(1, "Email or username is required"),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long",
  }),
})

type FormData = z.infer<typeof formSchema>

const getDashboardPath = (role: UserRole) => {
  if (role === 'admin') return '/dashboard'
  return `/dashboard/${role}`
}

export function SignInForm() {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [authError, setAuthError] = React.useState<AuthError | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get("callbackUrl") || "/dashboard"

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  const setUser = useAuthStore((state) => state.setUser)

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true)
      const result = await signIn("credentials", {
        emailOrUsername: data.emailOrUsername,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error(result.error)
        return
      }

      // Check if there's a callback URL to redirect to
      const callbackUrl = searchParams?.get("callbackUrl")
      if (callbackUrl) {
        router.push(callbackUrl) // Redirect to the original destination
      } else {
        router.push("/dashboard") // Default redirect
      }
      
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in with your email or username
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="emailOrUsername">Email or Username</Label>
          <Input
            id="emailOrUsername"
            type="text"
            placeholder="you@example.com or username"
            {...register("emailOrUsername")}
          />
          {errors.emailOrUsername && (
            <p className="text-sm text-red-500">{errors.emailOrUsername.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              {...register("password")}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        {authError && (
          <div className="text-sm text-red-500">{authError.message}</div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
       </div>

      <p className="px-8 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="underline underline-offset-4 hover:text-primary">
          Sign up
        </Link>
      </p>
    </div>
  )
}
