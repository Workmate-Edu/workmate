"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, Home, RefreshCcw } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const errorMessages = {
  "Please verify your email": {
    title: "Email Not Verified",
    message: "Your email address has not been verified. Please check your inbox for the verification link.",
    color: "text-yellow-500",
    primaryAction: {
      href: "/verify-email/pending",
      label: "Resend Verification Email",
      icon: <RefreshCcw className="mr-2 h-4 w-4" />
    }
  },
  "Invalid credentials": {
    title: "Invalid Credentials",
    message: "The email or password you entered is incorrect. Please try again.",
    color: "text-red-500",
    primaryAction: {
      href: "/sign-in",
      label: "Back to Sign In",
      icon: null
    }
  },
  "OAuthSignin": {
    title: "Google Sign In Error",
    message: "There was a problem signing in with Google. Please try again.",
    color: "text-red-500",
    primaryAction: {
      href: "/sign-in",
      label: "Back to Sign In",
      icon: null
    }
  },
  "OAuthCallback": {
    title: "Google Authentication Error",
    message: "There was an error processing your Google sign in. Please try again.",
    color: "text-red-500",
    primaryAction: {
      href: "/sign-in",
      label: "Try Again",
      icon: null
    }
  },
  "OAuthCreateAccount": {
    title: "Account Creation Failed",
    message: "We couldn't create your account with Google. Please try again or contact support.",
    color: "text-red-500",
    primaryAction: {
      href: "/sign-in",
      label: "Back to Sign In",
      icon: null
    }
  },
  "Configuration": {
    title: "Server Configuration Error",
    message: "There was an error with the server configuration. Please try again later.",
    color: "text-red-500",
    primaryAction: {
      href: "/sign-in",
      label: "Back to Sign In",
      icon: null
    }
  },
  "AccessDenied": {
    title: "Access Denied",
    message: "You don't have permission to access this resource.",
    color: "text-red-500",
    primaryAction: {
      href: "/sign-in",
      label: "Back to Sign In",
      icon: null
    }
  },
  "Verification": {
    title: "Verification Error",
    message: "There was an error verifying your credentials.",
    color: "text-red-500",
    primaryAction: {
      href: "/sign-in",
      label: "Try Again",
      icon: null
    }
  },
  "default": {
    title: "Authentication Error",
    message: "An unexpected error occurred during authentication. Please try again.",
    color: "text-red-500",
    primaryAction: {
      href: "/sign-in",
      label: "Back to Sign In",
      icon: <Home className="mr-2 h-4 w-4" />
    }
  }
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  
  const errorConfig = error ? errorMessages[error as keyof typeof errorMessages] || errorMessages.default : errorMessages.default;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="mx-auto w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="rounded-full bg-muted p-3">
            <AlertCircle className={`h-6 w-6 ${errorConfig.color}`} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {errorConfig.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {errorConfig.message}
            </p>
          </div>
        </div>

        <div className="flex flex-col space-y-4">
          <Link href={errorConfig.primaryAction.href}>
            <Button className="w-full">
              {errorConfig.primaryAction.icon}
              {errorConfig.primaryAction.label}
            </Button>
          </Link>
          {error !== "Configuration" && (
            <Link href="/">
              <Button variant="outline" className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Go to Homepage
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
