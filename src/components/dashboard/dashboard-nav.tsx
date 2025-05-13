"use client"

import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { 
  BookOpen, 
  Calendar, 
  ClipboardList,
  LayoutDashboard, 
  MessageSquare, 
  Settings,
  GraduationCap,
  Users,
  FolderOpen, // Add for Materials
  UserCircle, // Add for Profile
  Bell // Add Bell to imports
} from "lucide-react"
import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { useSocketContext } from "@/contexts/socket-context"

// Single source of routes with role-based visibility
const routes = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: (role: string) => `/dashboard/${role}`,
    color: "text-sky-500",
    roles: ['admin', 'teacher', 'student', 'parent'] // Available to all
  },
  {
    label: 'Initial Assessment',
    icon: GraduationCap,
    href: (role: string) => `/dashboard/student/assessments/initial`,
    color: "text-violet-500",
    roles: ['student'],
    description: 'Take your placement assessment',
    shouldShow: async (session) => {
      if (!session?.user?.id) return false;
      try {
        const res = await fetch('/api/student/profile', {
          headers: { 'Cache-Control': 'no-cache' }
        });
        const data = await res.json();
        return data?.studentProfile?.registeredAs === 'independent';
      } catch (error) {
        console.error('Failed to check student type:', error);
        return false;
      }
    }
  },
  {
    label: 'My Teachers',
    icon: Users,
    href: (role: string) => `/dashboard/student/teachers`,
    color: "text-emerald-500",
    roles: ['student'] // Show for all students
  },
  {
    label: 'My Students',
    icon: Users,
    href: (role: string) => `/dashboard/teacher/students`,
    color: "text-emerald-500",
    roles: ['teacher'],
    // Remove shouldShow condition - teachers should always see this
  },
  {
    label: 'Class Assessments',
    icon: ClipboardList,
    href: (role: string) => `/dashboard/teacher/assessments`,
    color: "text-violet-500",
    roles: ['teacher'],
    description: 'Manage class assessments and grades'
  },
  {
    label: 'My Assessments',
    icon: ClipboardList,
    href: (role: string) => `/dashboard/student/assessments`,
    color: "text-violet-500",
    roles: ['student'],
    description: 'View and complete your assessments'
  },
  {
    label: 'Question Bank',
    icon: ClipboardList,
    href: (role: string) => `/dashboard/${role}/questions`,

    color: "text-amber-500",
    roles: ['admin']
  },
  {
    label: 'My Courses',
    icon: BookOpen,
    href: (role: string) => `/dashboard/${role}/courses`,
    color: "text-indigo-500",
    roles: ['teacher', 'student'],
    description: role => role === 'teacher' ? 'Manage your subjects and teaching materials' : 'View your assigned courses'
  },
  // {
  //   label: 'Classes',
  //   icon: BookOpen,
  //   href: (role: string) => `/dashboard/${role}/classes`,
  //   color: "text-indigo-500",
  //   roles: ['student'] // Now only for students
  // },
  {
    label: 'Materials',
    icon: FolderOpen,
    href: (role: string) => `/dashboard/${role}/materials`,
    color: "text-yellow-500",
    roles: ['teacher'],
    description: 'Upload and manage teaching resources'
  },
  {
    label: 'My Sessions',
    icon: Calendar,
    href: (role: string) => `/dashboard/student/sessions`,
    color: "text-pink-500",
    roles: ['student'],
    description: 'View all scheduled classes'
  },
  {
    label: 'Teaching Schedule', 
    icon: Calendar,
    href: (role: string) => `/dashboard/teacher/sessions`,
    color: "text-pink-500",
    roles: ['teacher'],
    description: 'View and manage your teaching sessions'
  },
  {
    label: 'Schedule',
    icon: Calendar,
    href: (role: string) => `/dashboard/${role}/schedule`,
    color: "text-pink-500",
    roles: ['parent'], // Now only for parents
    description: "View your children's schedules"
  },
  {
    label: 'Messages',
    icon: MessageSquare,
    href: (role: string) => `/dashboard/${role}/messages`,
    color: "text-orange-500",
    roles: ['teacher', 'student', 'parent'],
    shouldShow: async (session) => {
      // Always show for teachers and parents
      if (session?.user?.role === 'teacher' || session?.user?.role === 'parent') {
        return true;
      }
      
      // For students, check if they are independent
      if (session?.user?.role === 'student') {
        try {
          const res = await fetch('/api/student/profile', {
            headers: { 'Cache-Control': 'no-cache' }
          });
          const data = await res.json();
          return data?.studentProfile?.registeredAs === 'independent';
        } catch (error) {
          console.error('Failed to check student type:', error);
          return false;
        }
      }
      
      return false;
    }
  },
  // {
  //   label: 'Settings',
  //   icon: Settings,
  //   href: (role: string) => `/dashboard/${role}/settings`,
  //   color: "text-gray-500",
  //   roles: ['teacher', 'student', 'parent', 'admin']
  // },
  {
    label: 'Students',
    icon: GraduationCap,
    href: (role: string) => `/dashboard/admin/students`,
    color: "text-emerald-500",
    roles: ['admin']
  },
  {
    label: 'Teachers',
    icon: Users,
    href: (role: string) => `/dashboard/admin/teachers`,
    color: "text-blue-500",
    roles: ['admin']
  },
  {
    label: 'Inital Assessments',
    icon: ClipboardList,
    href: (role: string) => `/dashboard/admin/assessments`,
    color: "text-violet-500",
    roles: ['admin']  // Only show for admin
  },
  {
    label: 'My Children',
    icon: Users,
    href: (role: string) => `/dashboard/parent/children`,
    color: "text-emerald-500",
    roles: ['parent'], // Only for parent users
    description: 'View and manage your children'
  },
  // Add Notifications route before Profile
  {
    label: 'Notifications',
    icon: Bell,
    href: (role: string) => `/dashboard/${role}/notifications`,
    color: "text-rose-500",
    roles: ['teacher', 'student', 'parent', 'admin'],
    description: 'View your notifications'
  },
  // Add Profile as last item for all users
  {
    label: 'Profile',
    icon: UserCircle,
    href: (role: string) => {
      switch (role) {
        case 'teacher':
          return '/dashboard/teacher/profile'
        case 'student':
          return '/dashboard/student/profile'
        case 'parent':
          return '/dashboard/parent/profile'
        default:
          return '/profile'
      }
    },
    color: "text-slate-500",
    roles: ['teacher', 'student', 'parent', 'admin'] // Available to all users
  }
]

export function DashboardNav() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [availableRoutes, setAvailableRoutes] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const { socket } = useSocketContext()
  const [studentProfile, setStudentProfile] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)

  // Fetch initial unread count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await fetch('/api/notifications?limit=1')
        const data = await res.json()
        setUnreadCount(data.unreadCount)
      } catch (error) {
        console.error('Failed to fetch notifications count:', error)
      }
    }

    if (session?.user?.id) {
      fetchUnreadCount()
    }
  }, [session?.user?.id])

  // Listen for new notifications
  useEffect(() => {
    if (!socket) return

    socket.on('notification', (data: any) => {
      if (data.type === 'new_notification') {
        setUnreadCount(prev => prev + 1)
      }
    })

    return () => {
      socket.off('notification')
    }
  }, [socket])

  useEffect(() => {
    const fetchStudentProfile = async () => {
      if (session?.user?.role === 'student') {
        try {
          const res = await fetch('/api/student/profile')
          const data = await res.json()
          setStudentProfile(data.studentProfile)
        } catch (error) {
          console.error('Failed to fetch student profile:', error)
        }
      }
    }

    fetchStudentProfile()
  }, [session])

  const isChildStudent = studentProfile?.registeredAs === 'child'

  useEffect(() => {
    let mounted = true;

    const filterRoutes = async () => {
      const userRole = session?.user?.role;
      console.log('Current user role:', userRole); // Debug log

      if (!userRole) return;

      try {
        const filteredRoutes = routes.filter(route => route.roles.includes(userRole));
        console.log('Filtered routes before shouldShow:', filteredRoutes); // Debug log

        const results = await Promise.all(
          filteredRoutes.map(async (route) => {
            if (route.shouldShow) {
              try {
                const show = await route.shouldShow(session);
                return show ? route : null;
              } catch (error) {
                console.error(`Error checking shouldShow for route ${route.label}:`, error);
                return route; // Fall back to showing the route if check fails
              }
            }
            return route;
          })
        );
        
        const finalRoutes = results.filter(Boolean);
        console.log('Final available routes:', finalRoutes); // Debug log
        
        if (mounted) {
          setAvailableRoutes(finalRoutes);
        }
      } catch (error) {
        console.error('Error filtering routes:', error);
      }
    };

    if (session) {
      filterRoutes();
    }

    return () => {
      mounted = false;
    };
  }, [session]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (session?.user?.role === 'student') {
        const res = await fetch('/api/student/profile')
        const data = await res.json()
        setProfile(data)
      }
    }
    
    fetchProfile()
  }, [session])

  const studentItems = [
    {
      title: "Dashboard",
      href: "/dashboard/student",
      icon: LayoutDashboard,
      show: true
    },
    {
      title: "Messages",
      href: "/dashboard/student/messages",
      icon: MessageSquare,
      show: studentProfile?.registeredAs === 'independent'
    },
    {
      title: "Teachers",
      href: "/dashboard/student/teachers",
      icon: Users,
      show: true
    },
    {
      title: "Assessments",
      href: "/dashboard/student/assessments",
      icon: ClipboardList,
      show: true
    }
  ].filter(item => item.show)

  const items = {
    student: studentItems,
    teacher: [/* ...existing teacher items... */],
    admin: [/* ...existing admin items... */],
    parent: [/* ...existing parent items... */]
  }

  return (
    <div className="space-y-4 py-4">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold">Dashboard</h2>
        <div className="space-y-1">
          {availableRoutes.map((route) => (
            <Link
              key={route.href(session?.user?.role as string)}
              href={route.href(session?.user?.role as string)}
              className={cn(
                "flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors",
                pathname === route.href(session?.user?.role as string) 
                  ? "bg-accent text-accent-foreground" 
                  : "text-muted-foreground"
              )}
            >
              <div className="flex items-center">
                <route.icon className={cn("mr-2 h-4 w-4", route.color)} />
                <span>{route.label}</span>
              </div>
              {/* {route.label === 'Notifications' && unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="ml-auto text-xs"
                >
                  {unreadCount}
                </Badge>
              )} */}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
