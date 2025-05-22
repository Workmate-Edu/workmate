import NextAuth from "next-auth"
import authOptions from "@/lib/auth"

export const runtime = 'nodejs' // Add this line for NextAuth
export const dynamic = 'force-dynamic'

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
