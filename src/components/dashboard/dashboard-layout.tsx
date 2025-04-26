"use client"

import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { ParentSidebar } from "./sidebars/parent-sidebar"
import { StudentSidebar } from "./sidebars/student-sidebar"
import { TeacherSidebar } from "./sidebars/teacher-sidebar"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { Menu } from "lucide-react"
import { Button } from "../ui/button"
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const { theme } = useTheme()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  
  // Extract role from pathname (e.g., /dashboard/parent -> parent)
  const role = pathname.split('/')[2] as "student" | "teacher" | "parent"

  const SidebarComponent = {
    student: StudentSidebar,
    teacher: TeacherSidebar,
    parent: ParentSidebar,
  }[role] || StudentSidebar

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  return (
    <div className={cn("min-h-screen", theme === 'dark' ? 'dark' : 'light')}>
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <SidebarComponent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetTrigger asChild className="md:hidden fixed top-4 left-4 z-50">
          <Button variant="ghost" size="icon" className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <SidebarComponent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="md:pl-64">
        <div className="min-h-screen">
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileOpen(true)}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open sidebar</span>
            </Button>

            {/* Placeholder for header content */}
            <div className="flex flex-1 gap-x-4 self-stretch items-center justify-end">
              <div className="flex items-center gap-x-4 lg:gap-x-6">
                {/* Add any header items like notifications, profile, etc. */}
              </div>
            </div>
          </div>
          
          <main className="py-6">
            <div className="px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
