import { useAuthStore } from "@/store/auth-store"
import { useSession } from "next-auth/react"
import { useMemo } from "react"

export function useNavbarAuth() {
  const { data: session, status } = useSession()
  const { user, isAuthenticated, isLoading } = useAuthStore()

  const navState = useMemo(() => {
    return {
      isAuthenticated,
      isLoading: isLoading || status === 'loading',
      user: user || session?.user || null,
      role: user?.role || session?.user?.role,
      showAuthButtons: !isLoading && !isAuthenticated,
      showUserMenu: !isLoading && isAuthenticated
    }
  }, [isAuthenticated, isLoading, status, session?.user, user])

  return navState
}
