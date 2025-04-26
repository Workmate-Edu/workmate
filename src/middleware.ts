import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Define allowed routes per role
const roleRoutes = {
  student: [
    '/dashboard/student',
    '/dashboard/student/assessments',
    '/dashboard/student/classes',
    '/dashboard/student/materials',
    '/dashboard/student/schedule',
    '/dashboard/student/progress'
  ],
  teacher: [
    '/dashboard/teacher',
    '/dashboard/teacher/classes',
    '/dashboard/teacher/questions',
    '/dashboard/teacher/students',
    '/dashboard/teacher/schedule'
  ],
  parent: [
    '/dashboard/parent',
    '/dashboard/parent/children',
    '/dashboard/parent/reports',
    '/dashboard/parent/schedule',
    '/dashboard/parent/payments'
  ],
  admin: [
    '/dashboard/admin',
    '/dashboard/admin/users',
    '/dashboard/admin/questions',
    '/dashboard/admin/analytics'
  ]
} as const

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const { pathname } = request.nextUrl

  // Allow public paths
  if (['/sign-in', '/sign-up', '/'].includes(pathname)) {
    return NextResponse.next()
  }

  // Require authentication
  if (!token) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  const role = token.role as keyof typeof roleRoutes

  // Handle dashboard routes
  if (pathname.startsWith('/dashboard')) {
    // Get base route (e.g., /dashboard/student/assessments -> /dashboard/student)
    const baseRoute = `/${pathname.split('/').slice(0, 3).join('/')}`
    
    // Check if user has access to this route
    const hasAccess = roleRoutes[role].some(route => pathname.startsWith(route))
    
    if (!hasAccess) {
      // Redirect to their default dashboard
      return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/sign-in',
    '/sign-up',
  ]
}
