import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"

export const authConfig = {
  pages: {
    signIn: "/sign-in",
    error: "/auth/error",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      return true // Allow all routes by default
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role
        session.user.id = token.id
      }
      return session
    }
  },
  providers: [], // configured in auth.ts
} satisfies NextAuthConfig

