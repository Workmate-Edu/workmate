"use client"

import { useSession, signOut as nextAuthSignOut } from "next-auth/react"
import type { Session } from "next-auth"

export interface WorkmateUser {
  id: string
  name: string
  email: string
  image?: string
  role: "admin" | "user"
}

export function useAuth() {
  const { data: session } = useSession()
  const user = session?.user as WorkmateUser | undefined

  return {
    user,
    session,
    signOut: nextAuthSignOut,
  }
}
