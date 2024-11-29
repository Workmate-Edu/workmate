import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

// Role-specific routes configuration
const roleRoutes = {
  parent: [
    '/',
    '/children',
    '/courses',
    '/messages',
    '/notifications',
    '/profile',
    '/schedule',
    '/settings'
  ],
  teacher: [
    '/',
    '/assignments',
    '/classes',
    '/courses',
    '/analytics',
    '/grades',
    '/messages',
    '/notifications',
    '/profile',
    '/schedule',
    '/settings',
    '/students'
  ],
  student: [
    '/',
    '/assignments',
    '/messages',
    '/my-classes',
    '/notifications',
    '/progress',
    '/schedule',
    '/settings'
  ]
}

// Valid roles
const validRoles = ['parent', 'teacher', 'student']

// Public paths that don't require authentication
const publicPaths = [
  '/',
  '/auth/login',
  '/auth/register',
  '/api/auth/callback/google',
  '/api/auth/session',
  '/api/auth/csrf',
  '/api/auth/signin',
  '/api/auth/signout',
  '/sign-in',
  '/sign-up',
  '/verify-email',
  '/change-password',
  '/subjects/stem',
  '/subjects/languages',
  '/subjects/business',
  '/assessment/stem',
  '/assessment/languages',
  '/assessment/business',
  "/about",
  "/contact",
  "/courses",
  "/arabic-center",
  "/safety",
  '/safety',
  '/assessment',
  '/subjects',
  "/about",
  "/contact",
  "/courses",
  "/arabic-center",
]

// API routes configuration
const apiRoutes = {
  public: [
    "/api/auth/sign-up",
    "/api/auth/sign-in",
    "/api/auth/verify",
    "/api/auth/resend-verification",
  ],
  protected: [
    "/api/dashboard",
    "/api/profile",
    "/api/user",
  ]
}

// Public assets that should always be accessible
const publicAssets = [
  "/_next",
  "/favicon.ico",
  "/workmate_logo.png",
  "/images",
  "/assets",
  "/android-chrome",
  "/apple-touch-icon",
  "/safari-pinned-tab.svg",
  "/site.webmanifest",
]

export async function middleware(request: NextRequest) {
  try {
    const path = request.nextUrl.pathname
    console.log('[Middleware] Processing path:', path)

    // 1. Always allow public assets
    if (publicAssets.some(asset => path.startsWith(asset))) {
      return NextResponse.next()
    }

    // 2. Get and validate token if present
    const token = request.cookies.get("auth_token")?.value
    let isValidToken = false
    let tokenPayload = null

    if (token) {
      try {
        if (!process.env.JWT_SECRET) {
          console.error('[Middleware] JWT_SECRET is not defined')
          throw new Error('JWT_SECRET is not defined')
        }

        const secret = new TextEncoder().encode(process.env.JWT_SECRET)
        const { payload } = await jwtVerify(token, secret)
        isValidToken = true
        tokenPayload = payload
        console.log('[Middleware] Token verified:', {
          id: payload.id,
          role: payload.role,
          exp: payload.exp
        })
      } catch (error) {
        console.error('[Middleware] Token verification failed:', error)
        isValidToken = false
      }
    }

    // 3. Handle API routes
    if (path.startsWith('/api/')) {
      if (apiRoutes.public.some(route => path.startsWith(route))) {
        return NextResponse.next()
      }

      if (apiRoutes.protected.some(route => path.startsWith(route))) {
        if (!isValidToken) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const requestHeaders = new Headers(request.headers)
        requestHeaders.set('user', JSON.stringify(tokenPayload))
        return NextResponse.next({
          request: { headers: requestHeaders },
        })
      }
    }

    // 4. Handle dashboard routes
    if (path.startsWith('/dashboard')) {
      // Require authentication for all dashboard routes
      if (!isValidToken) {
        console.log('[Middleware] Dashboard access without token')
        const response = NextResponse.redirect(new URL("/sign-in", request.url))
        response.cookies.delete("auth_token")
        return response
      }

      const pathParts = path.split('/')
      const userRole = tokenPayload?.role as string

      // Handle /dashboard root
      if (pathParts.length === 2) {
        return NextResponse.redirect(new URL(`/dashboard/${userRole}`, request.url))
      }

      // Handle /dashboard/[role]
      if (pathParts.length >= 3) {
        const urlRole = pathParts[2]

        // Validate role
        if (!validRoles.includes(urlRole)) {
          console.log('[Middleware] Invalid role in URL:', urlRole)
          return NextResponse.redirect(new URL(`/dashboard/${userRole}`, request.url))
        }

        // Check if user has access to this role's dashboard
        if (urlRole !== userRole) {
          console.log('[Middleware] Role mismatch:', { urlRole, userRole })
          return NextResponse.redirect(new URL(`/dashboard/${userRole}`, request.url))
        }

        // Check nested route access
        if (pathParts.length > 3) {
          const nestedRoute = `/${pathParts.slice(3).join('/')}`
          const allowedRoutes = roleRoutes[userRole as keyof typeof roleRoutes]
          
          console.log('[Middleware] Checking nested route access:', {
            nestedRoute,
            allowedRoutes,
            userRole
          })
          
          // Allow access to the nested route if it's in the allowed routes or starts with an allowed route
          const hasAccess = allowedRoutes.some(route => 
            nestedRoute === route || nestedRoute.startsWith(`${route}/`)
          )
          
          if (!hasAccess) {
            console.log('[Middleware] Invalid nested route:', nestedRoute)
            return NextResponse.redirect(new URL(`/dashboard/${userRole}`, request.url))
          }
        }
      }

      return NextResponse.next()
    }

    // 5. Handle public routes
    const isPublicRoute = publicPaths.some(route => path === route || path.startsWith(`${route}/`))
    if (isPublicRoute) {
      // Redirect authenticated users away from auth pages
      if (isValidToken && (path === "/sign-in" || path === "/sign-up")) {
        console.log('[Middleware] Authenticated user attempting to access auth page')
        return NextResponse.redirect(new URL(`/dashboard/${tokenPayload?.role}`, request.url))
      }
      return NextResponse.next()
    }

    // 6. Default: redirect to home
    return NextResponse.redirect(new URL("/", request.url))

  } catch (error) {
    console.error('[Middleware] Error:', error)
    return NextResponse.redirect(new URL("/sign-in", request.url))
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
