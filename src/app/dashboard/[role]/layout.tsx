"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { useAuth } from "@/hooks/use-auth"
import Loading from "@/app/loading"

export default function DashboardRoleLayout({
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
    return <Loading />
  }

  return (
    <div className="flex h-full">
      <DashboardSidebar role={params.role as string} />
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  )
}
