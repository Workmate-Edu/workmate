"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useRouter, usePathname } from "next/navigation"
import { useThemeContext } from "@/hooks/use-theme-context"
import { useAuth } from "@/hooks/use-auth"
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
} from "react-icons/fi"

interface ParentSidebarProps {
  mobile?: boolean
}

export function ParentSidebar({ mobile = false }: ParentSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { theme } = useThemeContext()
  const { signOut } = useAuth()

  const navigation = [
    { name: "Overview", href: "/dashboard/parent", icon: FiHome },
    { name: "Children", href: "/dashboard/parent/children", icon: FiUsers },
    { name: "Courses", href: "/dashboard/parent/courses", icon: FiBook },
    { name: "Schedule", href: "/dashboard/parent/schedule", icon: FiCalendar },
    { name: "Messages", href: "/dashboard/parent/messages", icon: FiMessageSquare },
    { name: "Notifications", href: "/dashboard/parent/notifications", icon: FiBell },
    { name: "Profile", href: "/dashboard/parent/profile", icon: FiUser },
    { name: "Settings", href: "/dashboard/parent/settings", icon: FiSettings },
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
              <Button
                key={item.name}
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
                onClick={() => router.push(item.href)}
              >
                <item.icon className={cn(
                  "w-5 h-5 mr-3",
                  isActive ? theme.text.accent : theme.text.muted
                )} />
                {item.name}
              </Button>
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
