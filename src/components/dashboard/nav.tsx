"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import type { UserRole } from "@/types/auth"
import {
  FiHome,
  FiBook,
  FiCalendar,
  FiMessageSquare,
  FiUsers,
  FiSettings,
} from "react-icons/fi"
import { BookOpen } from "react-icons/fi"

const roleSpecificLinks = {
  admin: [
    { href: "/dashboard", label: "Overview", icon: FiHome },
    { href: "/dashboard/users", label: "Users", icon: FiUsers },
    { href: "/dashboard/classes", label: "Classes", icon: FiBook },
  ],
  student: [
    { href: "/dashboard/student", label: "My Dashboard", icon: FiHome },
    { href: "/dashboard/student/classes", label: "My Classes", icon: FiBook },
    { href: "/dashboard/student/schedule", label: "Schedule", icon: FiCalendar },
    { href: "/dashboard/student/courses", label: "My Courses", icon: BookOpen },
  ],
  teacher: [
    { href: "/dashboard/teacher", label: "My Dashboard", icon: FiHome },
    { href: "/dashboard/teacher/classes", label: "My Classes", icon: FiBook },
    { href: "/dashboard/teacher/schedule", label: "Schedule", icon: FiCalendar },
  ],
  parent: [
    { href: "/dashboard/parent", label: "Overview", icon: FiHome },
    { href: "/dashboard/parent/children", label: "My Children", icon: FiUsers },
    { href: "/dashboard/parent/classes", label: "Classes", icon: FiBook },
  ],
}

interface NavProps {
  role: UserRole
}

export function DashboardNav({ role }: NavProps) {
  const pathname = usePathname()
  const links = roleSpecificLinks[role]

  return (
    <nav className="w-64 border-r bg-muted/10 p-6 space-y-6">
      <div className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted/50 transition-colors",
                pathname === link.href ? "bg-muted" : "transparent"
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          )
        })}
      </div>

      {/* Common links for all roles */}
      <div className="space-y-1 pt-4 border-t">
        <Link
          href="/dashboard/messages"
          className={cn(
            "flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted/50 transition-colors",
            pathname === "/dashboard/messages" ? "bg-muted" : "transparent"
          )}
        >
          <FiMessageSquare className="h-4 w-4" />
          Messages
        </Link>
        <Link
          href="/dashboard/settings"
          className={cn(
            "flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted/50 transition-colors",
            pathname === "/dashboard/settings" ? "bg-muted" : "transparent"
          )}
        >
          <FiSettings className="h-4 w-4" />
          Settings
        </Link>
      </div>
    </nav>
  )
}
