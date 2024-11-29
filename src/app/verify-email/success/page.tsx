"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function VerificationSuccessPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <div className="mx-auto mb-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Email Verified!
          </h1>
          <p className="text-sm text-muted-foreground">
            Your email has been successfully verified. You can now sign in to your account.
          </p>
        </div>

        <Button asChild>
          <Link href="/sign-in">
            Sign In
          </Link>
        </Button>
      </div>
    </div>
  );
}
