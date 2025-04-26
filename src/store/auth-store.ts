import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SessionUser } from '@/types/user'

interface Child {
  id: string
  name: string
  grade: string
  subjects: string[]
}

interface AuthState {
  user: SessionUser | null
  isLoading: boolean
  isAuthenticated: boolean
  children?: Child[]
  lastUpdated?: number
  lastSync?: number
  setUser: (user: SessionUser | null) => void
  setLoading: (isLoading: boolean) => void
  setAuthenticated: (isAuthenticated: boolean) => void
  setChildren: (children: Child[] | undefined) => void
  updateSession: (user: SessionUser | null) => void
  reset: () => void
  signOut: () => void
}

const initialState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  children: undefined,
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialState,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (isLoading) => set({ isLoading }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setChildren: (children) => set({ children }),
      updateSession: (user) => set({ 
        user,
        isAuthenticated: !!user,
        lastUpdated: Date.now()
      }),
      reset: () => set(initialState),
      signOut: () => {
        set({ 
          ...initialState, 
          isLoading: false,
          lastUpdated: Date.now() 
        })
      },
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        // Enhanced validation on rehydration
        if (state) {
          const now = Date.now()
          const lastUpdated = state.lastUpdated || 0
          
          // If session is older than 24 hours, clear it
          if (now - lastUpdated > 24 * 60 * 60 * 1000) {
            state.reset()
          } else {
            state.setLoading(false)
          }
        }
      },
    }
  )
)
