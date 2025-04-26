"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useRouter, usePathname } from "next/navigation"
import { useTheme } from "next-themes"
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
  const { theme } = useTheme()
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
    ? cn("h-full flex flex-col", theme === 'dark' ? 'dark' : 'light')
    : cn(
        "fixed inset-y-0 left-0 w-64 border-r",
        theme === 'dark' ? 'dark' : 'light',
        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      )

  return (
    <div className={sidebarClasses}>
      <div className="flex flex-col h-full">
        <div className={cn(
          "flex items-center justify-center h-16 px-4 border-b",
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        )}>
          <h1 className={cn("text-xl font-bold", theme === 'dark' ? 'text-white' : 'text-gray-900')}>
            Workmate
          </h1>
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
                    [theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100']: isActive,
                    [theme === 'dark' ? 'text-white' : 'text-gray-900']: isActive,
                    "font-medium before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-4/5 before:w-1 before:rounded-r": isActive,
                    [theme === 'dark' ? 'text-gray-400' : 'text-gray-600']: !isActive,
                    "before:bg-primary": isActive
                  }
                )}
                onClick={() => router.push(item.href)}
              >
                <item.icon className={cn(
                  "w-5 h-5 mr-3",
                  isActive ? (theme === 'dark' ? 'text-white' : 'text-gray-900') : (theme === 'dark' ? 'text-gray-400' : 'text-gray-600')
                )} />
                {item.name}
              </Button>
            )
          })}
        </nav>
        <div className="px-4 py-4 border-t">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start hover:bg-gray-100 dark:hover:bg-gray-800",
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            )}
            onClick={() => signOut()}
          >
            <FiLogOut className={cn("w-5 h-5 mr-3", theme === 'dark' ? 'text-gray-400' : 'text-gray-600')} />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  )
}
