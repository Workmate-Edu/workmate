"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "./use-auth"

export const useAuthGuard = () => {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(`/sign-in?callbackUrl=${encodeURIComponent(pathname)}`)
    }

    // Role-based protection
    if (user && pathname.startsWith("/dashboard")) {
      const dashboardRole = pathname.split("/")[2]
      if (dashboardRole && dashboardRole !== user.role && user.role !== "admin") {
        router.push(`/dashboard/${user.role}`)
      }
    }
  }, [user, isLoading, pathname, router])

  return { isAuthorized: !!user, isLoading }
}
