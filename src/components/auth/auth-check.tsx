"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function AuthCheck() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userRole = localStorage.getItem('user_role');

    // If no token, redirect to sign in
    if (!token) {
      router.replace('/sign-in');
      return;
    }

    // Check if we're in a dashboard route
    if (pathname?.startsWith('/dashboard/')) {
      const routeRole = pathname.split('/')[2];
      
      // If user's role doesn't match the route, redirect to their correct dashboard
      if (routeRole !== userRole) {
        router.replace(`/dashboard/${userRole}`);
      }
    }
  }, [pathname]);

  return null;
}
