"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useRouter, usePathname } from "next/navigation"
import { useTheme } from "next-themes"
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
  FiPlay,
  FiAward,
  FiClipboard, // Add this for Question Bank
  FiFolder, // Add this for Materials
} from "react-icons/fi"

interface TeacherSidebarProps {
  mobile?: boolean
}

export function TeacherSidebar({ mobile = false }: TeacherSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { theme } = useTheme()
  const { signOut } = useAuth()

  const navigation = [
    { name: "Dashboard", href: "/dashboard/teacher", icon: FiHome },
    { 
      name: "My Courses", 
      href: "/dashboard/teacher/courses", 
      icon: FiBook,
      // This will show all subjects/courses teacher is assigned to
    },
    { 
      name: "Schedule", 
      href: "/dashboard/teacher/schedule", 
      icon: FiCalendar,
      // Calendar view of all sessions across courses
    },
    { 
      name: "Students", 
      href: "/dashboard/teacher/students", 
      icon: FiUsers,
      // All assigned students across courses
    },
    { 
      name: "Messages", 
      href: "/dashboard/teacher/messages", 
      icon: FiMessageSquare,
      // Communication with students
    },
    { 
      name: "Materials", 
      href: "/dashboard/teacher/materials", 
      icon: FiFolder,
      // Teaching materials organized by course
    },
    { 
      name: "Question Bank", 
      href: "/dashboard/teacher/questions", 
      icon: FiClipboard,
      // Keep existing question bank functionality
    },
    { 
      name: "Settings", 
      href: "/dashboard/teacher/settings", 
      icon: FiSettings 
    },
  ]

  const sidebarClasses = mobile
    ? cn("h-full flex flex-col", theme === "dark" ? "bg-gray-900" : "bg-gray-100")
    : cn(
        "fixed inset-y-0 left-0 w-64 border-r",
        theme === "dark" ? "bg-gray-900" : "bg-gray-100",
        theme === "dark" ? "border-gray-700" : "border-gray-200"
      )

  return (
    <div className={sidebarClasses}>
      <div className="flex flex-col h-full">
        <div className={cn(
          "flex items-center justify-center h-16 px-4 border-b",
          theme === "dark" ? "border-gray-700" : "border-gray-200"
        )}>
          <h1 className={cn("text-xl font-bold", theme === "dark" ? "text-gray-100" : "text-gray-900")}>Workmate</h1>
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
                      [theme === "dark" ? "bg-gray-700" : "bg-gray-200"]: isActive,
                      [theme === "dark" ? "text-gray-100" : "text-gray-900"]: isActive,
                      "font-medium before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-4/5 before:w-1 before:rounded-r": isActive,
                      [theme === "dark" ? "text-gray-400" : "text-gray-600"]: !isActive,
                      "before:bg-primary": isActive
                    }
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5 mr-3",
                    isActive ? (theme === "dark" ? "text-gray-100" : "text-gray-900") : (theme === "dark" ? "text-gray-400" : "text-gray-600")
                  )} />
                  {item.name}
                </Button>
              </Link>
            )
          })}
        </nav>
        <div className={cn("p-4 border-t", theme === "dark" ? "border-gray-700" : "border-gray-200")}>
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
