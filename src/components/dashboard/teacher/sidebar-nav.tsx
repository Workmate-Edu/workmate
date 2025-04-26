"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  FiHome,
  FiUsers,
  FiBook,
  FiCalendar,
  FiMessageSquare,
  FiFileText,
  FiTrendingUp,
  FiDollarSign,
  FiSettings,
} from "react-icons/fi"

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string
    title: string
    icon: React.ReactNode
  }[]
}

export function TeacherSidebarNav({ className, items, ...props }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav
      className={cn(
        "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
        className
      )}
      {...props}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            pathname === item.href
              ? "bg-muted hover:bg-muted"
              : "hover:bg-transparent hover:underline",
            "justify-start gap-2"
          )}
        >
          {item.icon}
          {item.title}
        </Link>
      ))}
    </nav>
  )
}

export const teacherNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard/teacher",
    icon: <FiHome className="h-4 w-4" />,
  },
  {
    title: "Students",
    href: "/dashboard/teacher/students",
    icon: <FiUsers className="h-4 w-4" />,
  },
  {
    title: "Classes",
    href: "/dashboard/teacher/classes",
    icon: <FiBook className="h-4 w-4" />,
  },
  {
    title: "Schedule",
    href: "/dashboard/teacher/schedule",
    icon: <FiCalendar className="h-4 w-4" />,
  },
  {
    title: "Assignments",
    href: "/dashboard/teacher/assignments",
    icon: <FiFileText className="h-4 w-4" />,
  },
  {
    title: "Messages",
    href: "/dashboard/teacher/messages",
    icon: <FiMessageSquare className="h-4 w-4" />,
  },
  {
    title: "Analytics",
    href: "/dashboard/teacher/analytics",
    icon: <FiTrendingUp className="h-4 w-4" />,
  },
  {
    title: "Earnings",
    href: "/dashboard/teacher/earnings",
    icon: <FiDollarSign className="h-4 w-4" />,
  },
  {
    title: "Settings",
    href: "/dashboard/teacher/settings",
    icon: <FiSettings className="h-4 w-4" />,
  },
]
