"use client"

import { useAuth } from "@/hooks/use-auth"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading) {
      // Handle auth redirects
      if (!user && pathname.startsWith("/dashboard")) {
        router.replace(`/sign-in?callbackUrl=${pathname}`)
      } else if (user) {
        // Redirect from auth pages when logged in
        if (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up")) {
          router.replace(`/dashboard/${user.role}`)
        }
        // Redirect if email not verified
        if (!user.emailVerified && !pathname.startsWith("/auth/verify")) {
          router.replace("/auth/verify")
        }
      }
    }
  }, [user, isLoading, pathname, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return <>{children}</>
}