import { getServerSession } from "next-auth/next"
import { authConfig } from "./config"

export async function auth() {
  return await getServerSession(authConfig)
}

export async function getCurrentUser() {
  const session = await auth()
  return session?.user
}

export type AuthSession = Awaited<ReturnType<typeof auth>>
