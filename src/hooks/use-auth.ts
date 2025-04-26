import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo } from "react"
import { useAuthStore } from "@/store/auth-store"

export function useAuth() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const setUser = useAuthStore((state) => state.setUser)

  // Update user in store and trigger UI update
  useEffect(() => {
    if (session?.user) {
      setUser(session.user)
      window.dispatchEvent(new Event('session-change'))
    }
  }, [session, setUser])

  const signOut = useCallback(async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
      router.push('/sign-in')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }, [router])

  const isAuthorized = useCallback((requiredRole?: string) => {
    if (!session?.user) return false
    if (!requiredRole) return true
    return session.user.role === requiredRole || session.user.role === 'admin'
  }, [session?.user])

  return useMemo(() => ({
    user: session?.user,
    session,
    status,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    isAuthorized,
    signOut,
    updateSession: update
  }), [session, status, isAuthorized, signOut, update])
}