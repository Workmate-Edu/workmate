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
  FolderOpen, 
  UserCircle, 
  Bell, 
  CreditCard 
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
    href: (role: string) => `/dashboard/${role}/assessments/initial`,
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
    href: (role: string) => `/dashboard/${role}/teachers`,
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
    href: (role: string) => `/dashboard/${role}/assessments`,
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
    href: (role: string) => `/dashboard/${role}/sessions`,
    color: "text-pink-500",
    roles: ['student'],
    description: 'View all scheduled classes',
  },
  {
    label: 'Sessions',
    icon: Calendar,
    href: (role: string) =>
      role === "admin"
        ? "/dashboard/admin/sessions"
        : `/dashboard/${role}/sessions`,
    color: "text-pink-500",
    roles: ["teacher", "admin"]
  },
   {
    label: 'Children Sessions',
    icon: Calendar,
    href: (role: string) =>
      `/dashboard/parent/children-sessions`,
    color: "text-pink-500",
    roles: ["parent"]
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
  },
  {
    label: "Subscriptions",
    icon: CreditCard,
    href: (role: string) => "/dashboard/admin/subscriptions",
    color: "text-blue-500",
    roles: ["admin"]
  }
]

export function DashboardNav() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [availableRoutes, setAvailableRoutes] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const { socket } = useSocketContext()
  const [isIndependentStudent, setIsIndependentStudent] = useState(false)
   const [isLearningParent, setIsLearningParent] = useState(false)

  // Detect independent student
  useEffect(() => {
    const checkStudentType = async () => {
      if (session?.user?.role !== "student") return
      try {
        const res = await fetch('/api/student/profile', { headers: { 'Cache-Control': 'no-cache' } })
        const data = await res.json()
        setIsIndependentStudent(data?.studentProfile?.registeredAs === 'independent')
      } catch {
        setIsIndependentStudent(false)
      }
    }
    checkStudentType()
  }, [session?.user?.role])

  // wE WILL COME BACK TO PARENT THAT WANT TO LEARN TO HAVE ACCESS TO TEACHER FEATURES SUCH AS ASSESSMENT, MY TEACHERS ETC

  // fetch “interestedInLearning” for parent users
  //  useEffect(() => {
  //   if (session?.user?.role !== "parent") return
  //   fetch("/api/parent/profile", { headers: { "Cache-Control": "no-cache" } })
  //     .then(r => r.json())
  //     .then(data => {
  //       setIsLearningParent(!!data.parentProfile?.interestedInLearning)
  //     })
  //     .catch(() => setIsLearningParent(false))
  // }, [session?.user?.role])

  
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
    let mounted = true;

    const filterRoutes = async () => {
      const userRole = session?.user?.role;
      console.log('Current user role:', userRole); // Debug log

      if (!userRole) return;

      try {
        const filteredRoutes = routes.filter(route => 
          route.roles.includes(userRole)
          // We will come back to implment parent interest in learning features

      //   || (userRole === 'parent'
      //   && isLearningParent
      //   && route.roles.includes('student')
      // )

    );
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
  // }, [session, isLearningParent, isIndependentStudent]);
  }, [session]);


  //  useEffect(() => {
  //   if (!session?.user?.role) return
  //   let mounted = true

  //   async function filterRoutes() {
  //     const role = session.user.role
  //     // first, pull in any route that matches your exact role,
  //     // plus, if you’re a “learning parent,” also pull in all student-only routes
  //     const filtered = routes.filter(rt =>
  //       rt.roles.includes(role) ||
  //       (role === "parent" && isLearningParent && rt.roles.includes("student"))
  //     )

  //     // apply any `shouldShow` hooks you have on each route
  //     const withShouldShow = await Promise.all(
  //       filtered.map(async rt => {
  //         if (rt.shouldShow) {
  //           try {
  //             return (await rt.shouldShow(session)) ? rt : null
  //           } catch {
  //             return rt
  //           }
  //         }
  //         return rt
  //       })
  //     ).then(list => list.filter(Boolean) as typeof routes)

  //     if (mounted) setAvailableRoutes(withShouldShow)
  //   }

  //   filterRoutes()
  //   return () => { mounted = false }
  // }, [session, isLearningParent, isIndependentStudent])

  const navItems = [
    ...availableRoutes,
    {
      label: "Subscription",
      icon: CreditCard,
      href: (role: string) =>
        role === "parent"
          ? "/dashboard/parent/subscription"
          : "/dashboard/student/subscription",
      color: "text-blue-500",
      roles: ["parent", "student"],
      show:
        (session?.user?.role === "parent") ||
        (session?.user?.role === "student" && isIndependentStudent)
    },
    {
      label: "Earnings",
      icon: CreditCard,
      href: (role: string) =>
        role === "admin"
          ? "/dashboard/admin/earnings"
          : "/dashboard/teacher/earnings",
      color: "text-green-600",
      roles: ["admin", "teacher"]
    }
  ].filter(item => {
    if (!session?.user?.role) return false
    // Only show if the current user's role is allowed for this route and show is not false
    return item.roles.includes(session.user.role) && (item.show === undefined || item.show)
  })

  //  const navItems = [
  //   ...availableRoutes,
  //   {
  //     label: "Subscription",
  //     icon: CreditCard,
  //     href: (role: string) =>
  //       role === "parent"
  //         ? "/dashboard/parent/subscription"
  //         : "/dashboard/student/subscription",
  //     color: "text-blue-500",
  //     roles: ["parent", "student"],
  //     show:
  //       session?.user?.role === "parent" ||
  //       (session?.user?.role === "student" && isIndependentStudent)
  //   },
  //   {
  //     label: "Earnings",
  //     icon: CreditCard,
  //     href: (role: string) =>
  //       role === "admin"
  //         ? "/dashboard/admin/earnings"
  //         : "/dashboard/teacher/earnings",
  //     color: "text-green-600",
  //     roles: ["admin", "teacher"]
  //   }
  // ]
  // .filter(item => {
  //   const role = session?.user?.role
  //   if (!role) return false

  //   // allow if it’s your own role…
  //   const okForYourRole = item.roles.includes(role)
  //   // …or, if you’re a learning parent, allow student-only items too
  //   const okAsLearningParent =
  //     role === "parent" &&
  //     isLearningParent &&
  //     item.roles.includes("student")

  //   const passesShowFlag = item.show === undefined || item.show

  //   return (okForYourRole || okAsLearningParent) && passesShowFlag
  // })

  return (
    <div className="space-y-4 py-4">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold">Dashboard</h2>
        <div className="space-y-1">
          {navItems.map((route) => (
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
