"use client"

import { useRouter } from "next/navigation"
import { createContext, useContext, useEffect, useState } from "react"
import Cookies from "js-cookie"

interface User {
  id: string
  name: string
  email: string
  role: string
  image?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  signOut: () => void
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  signOut: () => {},
  checkAuth: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const checkAuth = async () => {
    const token = Cookies.get("auth_token")
    
    if (!token) {
      setUser(null)
      setIsAuthenticated(false)
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        console.error("Auth check failed:", await response.text())
        // Don't clear token on network errors or 5xx errors
        if (response.status === 401 || response.status === 403) {
          Cookies.remove("auth_token")
          setUser(null)
          setIsAuthenticated(false)
        }
        return
      }

      const data = await response.json()
      if (data.user) {
        setUser(data.user)
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      // Don't clear token on network errors
      if (error instanceof Error && error.message.includes("token")) {
        Cookies.remove("auth_token")
        setUser(null)
        setIsAuthenticated(false)
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const signOut = async () => {
    try {
      // Call the sign-out endpoint first
      const response = await fetch('/api/auth/sign-out', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include' // Important for cookie operations
      })

      if (!response.ok) {
        throw new Error('Failed to sign out')
      }

      // Then clear the cookie on the client side to ensure it's removed
      Cookies.remove('auth_token', { 
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })

      // Clear the user state
      setUser(null)
      setIsAuthenticated(false)

      // Finally redirect to sign-in page
      router.push('/auth/sign-in')
    } catch (error) {
      console.error('[Sign-out Error]:', error)
      // toast({
      //   title: 'Error',
      //   description: 'Failed to sign out. Please try again.',
      //   variant: 'destructive',
      // })
    }
  }

  const value = {
    user,
    isAuthenticated,
    isLoading,
    signOut,
    checkAuth
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
