"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useRouter, usePathname } from "next/navigation"
import { useThemeContext } from "@/hooks/use-theme-context"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import {
  FiHome,
  FiBook,
  FiUser,
  FiSettings,
  FiLogOut,
  FiUsers,
  FiCalendar,
  FiBell,
  FiMessageSquare,
  FiBarChart2,
} from "react-icons/fi"

interface TeacherSidebarProps {
  mobile?: boolean
}

export function TeacherSidebar({ mobile = false }: TeacherSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { theme } = useThemeContext()
  const { signOut } = useAuth()

  const navigation = [
    { name: "Overview", href: "/dashboard/teacher", icon: FiHome },
    { name: "My Classes", href: "/dashboard/teacher/classes", icon: FiUsers },
    { name: "Courses", href: "/dashboard/teacher/courses", icon: FiBook },
    { name: "Analytics", href: "/dashboard/teacher/analytics", icon: FiBarChart2 },
    { name: "Schedule", href: "/dashboard/teacher/schedule", icon: FiCalendar },
    { name: "Messages", href: "/dashboard/teacher/messages", icon: FiMessageSquare },
    { name: "Notifications", href: "/dashboard/teacher/notifications", icon: FiBell },
    { name: "Profile", href: "/dashboard/teacher/profile", icon: FiUser },
    { name: "Settings", href: "/dashboard/teacher/settings", icon: FiSettings },
  ]

  const sidebarClasses = mobile
    ? cn("h-full flex flex-col", theme.background.light)
    : cn(
        "fixed inset-y-0 left-0 w-64 border-r",
        theme.background.light,
        theme.border
      )

  return (
    <div className={sidebarClasses}>
      <div className="flex flex-col h-full">
        <div className={cn(
          "flex items-center justify-center h-16 px-4 border-b",
          theme.border
        )}>
          <h1 className={cn("text-xl font-bold", theme.text.light)}>Workmate</h1>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.name} href={item.href} className="block">
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start relative hover:bg-gray-100 dark:hover:bg-gray-800",
                    {
                      [theme.background.accent]: isActive,
                      [theme.text.accent]: isActive,
                      "font-medium before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-4/5 before:w-1 before:rounded-r": isActive,
                      [theme.text.light]: !isActive,
                      "before:bg-primary": isActive
                    }
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5 mr-3",
                    isActive ? theme.text.accent : theme.text.muted
                  )} />
                  {item.name}
                </Button>
              </Link>
            )
          })}
        </nav>
        <div className={cn("p-4 border-t", theme.border)}>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start",
              "text-red-600 dark:text-red-400",
              "hover:text-red-700 dark:hover:text-red-300",
              "hover:bg-red-50 dark:hover:bg-red-950/50"
            )}
            onClick={() => signOut()}
          >
            <FiLogOut className="w-5 h-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  )
}
