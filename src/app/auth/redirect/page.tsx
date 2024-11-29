'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

export default function AuthRedirect() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/sign-in');
      return;
    }

    // Get return URL from query params if it exists
    const params = new URLSearchParams(window.location.search);
    const returnTo = params.get('returnTo');

    if (returnTo && (returnTo.includes('/calendar') || returnTo.includes('/dashboard'))) {
      router.push(returnTo);
      return;
    }

    // Default to role-based dashboard
    if (session.user?.role) {
      router.push(`/dashboard/${session.user.role}`);
      return;
    }

    // Fallback to home
    router.push('/');
  }, [session, status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Redirecting you to the right place...</p>
      </div>
    </div>
  );
}
