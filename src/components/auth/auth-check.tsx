"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useSession } from 'next-auth/react';

interface AuthCheckProps {
  children: React.ReactNode
}

export function AuthCheck({ children }: AuthCheckProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const { status } = useSession();

  useEffect(() => {
    if (status === "loading") return

    // If not authenticated, redirect to sign in
    if (status === "unauthenticated") {
      router.replace('/sign-in')
      return
    }

    // Check if we're in a dashboard route
    if (pathname?.startsWith('/dashboard/')) {
      const routeRole = pathname.split('/')[2]
      
      // If user's role doesn't match the route, redirect to their correct dashboard
      if (routeRole !== user?.role) {
        router.replace(`/dashboard/${user?.role}`)
      }
    }
  }, [pathname, status, user, router])

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (status === "unauthenticated") {
    return null
  }

  return <>{children}</>
}
