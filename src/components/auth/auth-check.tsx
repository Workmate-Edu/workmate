"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

interface AuthCheckProps {
  children: React.ReactNode
}

export function AuthCheck({ children }: AuthCheckProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, status } = useAuth();

  useEffect(() => {
    if (status === "loading") return;

    // If not authenticated, redirect to sign in
    if (status === "unauthenticated") {
      router.replace('/sign-in');
      return;
    }

    // Only check role matching for dashboard routes
    if (pathname?.startsWith('/dashboard/')) {
      const routeRole = pathname.split('/')[2];
      if (user && routeRole && routeRole !== user.role) {
        router.replace(`/dashboard/${user.role}`);
      }
    }
  }, [pathname, status, user, router]);

  // Don't show loading state here since parent components handle it
  if (status === "unauthenticated") {
    return null;
  }

  return <>{children}</>;
}
