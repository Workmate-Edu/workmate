"use client"

import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { useSession } from "next-auth/react"
import { useEffect } from "react"
import { useSocketContext } from "@/contexts/socket-context"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = useSession()
  const { socket, isConnected } = useSocketContext()

  useEffect(() => {
    if (!socket || !session?.user?.id) return
    
    // Socket is already handled by SocketProvider
    console.log('Dashboard socket state:', {
      connected: isConnected,
      userId: session.user.id,
      role: session.user.role
    })
  }, [socket, session?.user?.id, isConnected])

  return (
    <div className="flex min-h-screen">
      <DashboardNav />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
