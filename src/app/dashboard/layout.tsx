"use client"

import { useState, useEffect } from "react"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { MobileToggle } from "@/components/mobile-toggle"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSidebarStore } from "@/store/sidebar-store"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { useSocketContext } from "@/contexts/socket-context"
import { Logo } from "@/components/logo"
import { usePathname } from "next/navigation"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = useSession()
  const { socket, isConnected } = useSocketContext()
  const { isOpen, closeSidebar } = useSidebarStore()
  const pathname = usePathname()

  useEffect(() => {
    if (!socket || !session?.user?.id) return
    
    // Socket is already handled by SocketProvider
    console.log('Dashboard socket state:', {
      connected: isConnected,
      userId: session.user.id,
      role: session.user.role
    })
  }, [socket, session?.user?.id, isConnected])

  // Close sidebar on route change
  useEffect(() => {
    if (isOpen) {
      closeSidebar()
    }
  }, [pathname]) // Listen for pathname changes

  return (
    <div className="relative min-h-screen">
      {/* Overlay with click handler */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => closeSidebar()}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed top-0 left-0 z-50 h-screen w-72 border-r bg-background transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "md:translate-x-0" // Always show on desktop
      )}>
        {/* Header with Logo and Close */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
           <Logo />
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={closeSidebar}
            className="md:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <DashboardNav />
      </div>

      {/* Main content */}
      <div className={cn(
        "transition-all duration-300",
        "md:ml-72"
      )}>
        {/* Top bar with toggle on mobile */}
        <div className="sticky top-0 z-40 flex items-center gap-4 border-b bg-background px-4 h-[57px] md:hidden">
          <MobileToggle />
        </div>

        <main className="p-4">{children}</main>
      </div>
    </div>
  )
}
