"use client"

import { useParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthCheck } from "@/components/auth/auth-check"

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams()
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user?.role !== params.role) {
      router.push(`/dashboard/${user?.role}`)
    }
  }, [user, isLoading, params.role, router])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex h-full min-h-screen">
      <DashboardSidebar role={params.role as string} />
      <main className="flex-1 overflow-y-auto p-6">
        <AuthCheck />
        {children}
      </main>
    </div>
  )
}
