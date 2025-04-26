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
import { TeacherSidebarNav, teacherNavItems } from "./teacher/sidebar-nav"

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
} as const

type Route = {
  href: string
  label: string
  icon: React.ComponentType
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
} as const

type EnabledFeatures = typeof enabledFeatures.teacher
type FeatureKey = keyof EnabledFeatures

function getFeatureKey(href: string): FeatureKey | undefined {
  const key = href.split("/").pop() as string
  return key in enabledFeatures.teacher ? (key as FeatureKey) : undefined
}

interface DashboardSidebarProps {
  role: "student" | "teacher" | "parent"
}

export function DashboardSidebar({ role }: DashboardSidebarProps) {
  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:bg-gray-100/40 lg:pt-5 lg:pb-4">
      <div className="flex flex-col flex-1 gap-y-5 overflow-y-auto px-6">
        {role === "teacher" && (
          <TeacherSidebarNav items={teacherNavItems} />
        )}
        {role !== "teacher" && (
          <nav className="flex w-64 flex-col border-r bg-background px-4 py-6">
            <div className="space-y-4">
              {roleRoutes[role].map((route) => {
                const featureKey = getFeatureKey(route.href)
                return (
                  <ComingSoonWrapper
                    key={route.href}
                    isEnabled={featureKey ? enabledFeatures.teacher[featureKey] : false}
                    feature={`${route.label} feature coming soon!`}
                  >
                    <Link
                      href={route.href}
                      className={cn(
                        "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        usePathname() === route.href
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent"
                      )}
                    >
                      <route.icon className="h-5 w-5" />
                      <span>{route.label}</span>
                    </Link>
                  </ComingSoonWrapper>
                )
              })}
            </div>
          </nav>
        )}
      </div>
    </aside>
  )
}
