"use client"

import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { ParentSidebar } from "./sidebars/parent-sidebar"
import { StudentSidebar } from "./sidebars/student-sidebar"
import { TeacherSidebar } from "./sidebars/teacher-sidebar"
import { useThemeContext } from "@/hooks/use-theme-context"
import { useState, useEffect } from "react"
import { Menu } from "lucide-react"
import { Button } from "../ui/button"
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const { theme } = useThemeContext()
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
    <div className={cn("min-h-screen", theme.background.default)}>
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <SidebarComponent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetTrigger asChild className="md:hidden fixed top-4 left-4 z-50">
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72">
          <SidebarComponent mobile />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="md:pl-4">
        <main className="p-4 md:p-4">{children}</main>
      </div>
    </div>
  )
}
