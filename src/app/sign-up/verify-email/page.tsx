"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Mail } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyEmailPage() {
  const [isResending, setIsResending] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Try to get email from URL or local storage
  const storedEmail = typeof window !== 'undefined' 
    ? localStorage.getItem('signup_email') 
    : null;
  const email = searchParams.get('email') || storedEmail;

  const handleResendVerification = async () => {
    if (!email) {
      toast.error("No email found. Please sign up again.");
      router.push('/sign-up');
      return;
    }

    setIsResending(true);

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Verification email resent successfully!');
      } else {
        toast.error(data.error || 'Failed to resend verification email');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
      console.error('Resend verification error:', error);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="container relative flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-primary" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Link href="/">WorkMate</Link>
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;We're excited to have you join our community. Check your email to get started!&rdquo;
            </p>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Check your email
            </h1>
            <p className="text-center text-sm text-muted-foreground">
              We've sent you a verification link to your email address.
              Click the link to verify your account.
            </p>
          </div>
          <div className="grid gap-4">
            <Button asChild variant="outline">
              <Link href="/sign-in">
                Back to Sign In
              </Link>
            </Button>
            <p className="px-6 text-center text-sm text-muted-foreground">
              Didn't receive the email?{" "}
              <button 
                className="underline underline-offset-4 hover:text-primary"
                onClick={handleResendVerification}
                disabled={isResending}
              >
                {isResending ? 'Resending...' : 'Click to resend'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
