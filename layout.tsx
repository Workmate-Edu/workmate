"use client"

import { useParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthCheck } from "@/components/auth/auth-check"
import { useSession } from "next-auth/react"

type ValidRole = "student" | "teacher" | "parent"

function isValidRole(role: string): role is ValidRole {
  return ["student", "teacher", "parent"].includes(role)
}

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams()
  const { user } = useAuth()
  const { status } = useSession()
  const router = useRouter()
  const role = params.role as string

  useEffect(() => {
    if (status !== "loading" && user?.role !== role) {
      router.push(`/dashboard/${user?.role}`)
    }
  }, [user, status, role, router])

  if (!isValidRole(role)) {
    return null
  }

  if (status === "loading") {
    return <div>Loading...</div>
  }

  return (
    <AuthCheck>
      <div className="flex min-h-screen">
        <DashboardSidebar role={role} />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </AuthCheck>
  )
}
