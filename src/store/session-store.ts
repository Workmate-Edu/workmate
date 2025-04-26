import { create } from 'zustand'
import { type Session } from 'next-auth'

interface SessionStore {
  session: Session | null
  setSession: (session: Session | null) => void
}

export const useSessionStore = create<SessionStore>((set) => ({
  session: null,
  setSession: (session) => set({ session })
}))
