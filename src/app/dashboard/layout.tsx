"use client"

import { Menu } from "lucide-react"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useSocketContext } from "@/contexts/socket-context"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { cn } from "@/lib/utils"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()
  const { socket, connect, disconnect, isConnected } = useSocketContext()

  // Socket connection management
  useEffect(() => {
    if (session?.user?.id) {
      connect({
        userId: session.user.id,
        role: session.user.role
      })

      // Cleanup function
      return () => {
        if (isConnected) {
          disconnect()
        }
      }
    }
  }, [session?.user, connect, disconnect, isConnected])

  // Replace redirect with router.push since we're in a client component
  useEffect(() => {
    if (!session?.user?.role) {
      router.push("/sign-in")
      return
    }
  }, [session, router])

  useEffect(() => {
    if (!session?.user?.id || !socket) return

    // Handle session notifications
    socket.on('notification', (data: any) => {
      if (data.type === 'session_update') {
        const notification = data.notification
        
        switch (notification.type) {
          case 'session_created':
            toast.success(notification.message, {
              description: 'New session has been scheduled',
              action: {
                label: 'View',
                onClick: () => router.push('/dashboard/schedule')
              }
            })
            break;
          
          case 'session_cancelled':
            toast.error(notification.message, {
              description: 'A session has been cancelled'
            })
            break;

          default:
            toast.info(notification.message)
        }
      }
    })

    return () => {
      socket.off('notification')
    }
  }, [session?.user?.id, socket, router])

  return (
    <div className="flex min-h-screen flex-col">
      {/* Mobile Nav Button */}
      <button 
        onClick={() => setMobileNavOpen(!mobileNavOpen)}
        className="md:hidden fixed bottom-4 right-4 z-50 bg-primary text-primary-foreground p-3 rounded-full shadow-lg"
        aria-label={mobileNavOpen ? "Close sidebar" : "Open sidebar"}
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Overlay for mobile sidebar */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col md:grid md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)]">
        {/* Sidebar - responsive */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-50 w-[220px] bg-background border-r transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
          mobileNavOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <DashboardNav />
        </aside>

        {/* Main Content - better padding for mobile */}
        <main className="flex-1 min-w-0 px-4 py-6 md:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}
