"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  const onSubmit = useCallback(async () => {
    if (!token) {
      setError("Missing verification token");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Something went wrong");
      }

      setSuccess(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    onSubmit();
  }, [onSubmit]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/30">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <div className="flex flex-col items-center space-y-2 text-center">
          {isLoading ? (
            <>
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <h1 className="text-2xl font-semibold tracking-tight">
                Verifying your email...
              </h1>
              <p className="text-sm text-muted-foreground">
                Please wait while we verify your email address.
              </p>
            </>
          ) : success ? (
            <>
              <div className="rounded-full p-3 bg-green-100">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-green-600">
                Email Verified!
              </h1>
              <p className="text-sm text-muted-foreground">
                Your email has been successfully verified. You can now sign in to your account.
              </p>
              <div className="pt-4 w-full">
                <Button asChild className="w-full">
                  <Link href="/sign-in">Continue to Sign In</Link>
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-full p-3 bg-red-100">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-red-600">
                Verification Failed
              </h1>
              <p className="text-sm text-muted-foreground">
                {error || "Something went wrong while verifying your email."}
              </p>
              <div className="pt-4 w-full space-y-4">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/verify-email/pending">Resend Verification Email</Link>
                </Button>
                <Button asChild className="w-full">
                  <Link href="/sign-in">Back to Sign In</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
