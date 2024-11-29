"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  FiHome,
  FiUsers,
  FiBook,
  FiCalendar,
  FiMessageSquare,
  FiSettings,
  FiUser,
} from "react-icons/fi"
import { ComingSoonWrapper } from "@/components/ui/coming-soon"

const roleRoutes = {
  parent: [
    { href: "/dashboard/parent", label: "Dashboard", icon: FiHome },
    { href: "/dashboard/parent/children", label: "Children", icon: FiUsers },
    { href: "/dashboard/parent/courses", label: "Courses", icon: FiBook },
    { href: "/dashboard/parent/schedule", label: "Schedule", icon: FiCalendar },
    { href: "/dashboard/parent/messages", label: "Messages", icon: FiMessageSquare },
    { href: "/dashboard/parent/profile", label: "Profile", icon: FiUser },
    { href: "/dashboard/parent/settings", label: "Settings", icon: FiSettings },
  ],
  teacher: [
    { href: "/dashboard/teacher", label: "Dashboard", icon: FiHome },
    { href: "/dashboard/teacher/students", label: "Students", icon: FiUsers },
    { href: "/dashboard/teacher/courses", label: "Courses", icon: FiBook },
    { href: "/dashboard/teacher/schedule", label: "Schedule", icon: FiCalendar },
    { href: "/dashboard/teacher/messages", label: "Messages", icon: FiMessageSquare },
    { href: "/dashboard/teacher/profile", label: "Profile", icon: FiUser },
    { href: "/dashboard/teacher/settings", label: "Settings", icon: FiSettings },
  ],
  student: [
    { href: "/dashboard/student", label: "Dashboard", icon: FiHome },
    { href: "/dashboard/student/courses", label: "Courses", icon: FiBook },
    { href: "/dashboard/student/schedule", label: "Schedule", icon: FiCalendar },
    { href: "/dashboard/student/messages", label: "Messages", icon: FiMessageSquare },
    { href: "/dashboard/student/profile", label: "Profile", icon: FiUser },
    { href: "/dashboard/student/settings", label: "Settings", icon: FiSettings },
  ],
}

const enabledFeatures = {
  teacher: {
    dashboard: true,
    "live-class": true,
    students: false,
    resources: true,
    assignments: true,
    schedule: true,
    messages: false,
    settings: true,
  }
}

interface DashboardSidebarProps {
  role: string
}

export function DashboardSidebar({ role }: DashboardSidebarProps) {
  const pathname = usePathname()
  const routes = roleRoutes[role as keyof typeof roleRoutes] || []
  const enabledMap = enabledFeatures[role as keyof typeof enabledFeatures] || {}

  return (
    <nav className="flex w-64 flex-col border-r bg-background px-4 py-6">
      <div className="space-y-4">
        {routes.map((route) => (
          <ComingSoonWrapper
            key={route.href}
            isEnabled={enabledMap[route.href.split("/").pop() as string] ?? false}
            feature={`${route.label} feature coming soon!`}
          >
            <Link
              href={route.href}
              className={cn(
                "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === route.href
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              )}
            >
              <route.icon className="h-5 w-5" />
              <span>{route.label}</span>
            </Link>
          </ComingSoonWrapper>
        ))}
      </div>
    </nav>
  )
}
