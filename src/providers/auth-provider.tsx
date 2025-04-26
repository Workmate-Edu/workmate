"use client"

import { SessionProvider, useSession } from "next-auth/react"
import { useEffect } from "react"
import { useAuthStore } from "@/store/auth-store"

function SessionSync() {
  const { data: session, status } = useSession()
  const updateSession = useAuthStore(state => state.updateSession)
  const setLoading = useAuthStore(state => state.setLoading)

  useEffect(() => {
    setLoading(status === 'loading')
    if (status === 'authenticated') {
      updateSession(session.user)
    } else if (status === 'unauthenticated') {
      updateSession(null)
    }
  }, [session, status, updateSession, setLoading])

  return null
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionSync />
      {children}
    </SessionProvider>
  )
}
