"use client";

import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import Link from "next/link";

export default function VerificationPendingPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <div className="mx-auto mb-4">
            <Mail className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Check your email
          </h1>
          <p className="text-sm text-muted-foreground">
            We've sent you a verification link to your email address.
            Please check your inbox and click the link to verify your account.
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
              onClick={() => {
                // TODO: Implement resend verification email
                alert("Verification email resent!");
              }}
            >
              Click to resend
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
