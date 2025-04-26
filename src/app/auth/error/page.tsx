"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get("error");
  const callbackUrl = searchParams.get("callbackUrl");

  useEffect(() => {
    // Handle email verification redirect
    if (callbackUrl?.includes("/verify-email")) {
      router.replace(callbackUrl);
      return;
    }

    // Handle verification error separately
    if (error?.toLowerCase().includes("verify")) {
      const email = searchParams.get("email");
      router.replace(`/verify-email?email=${encodeURIComponent(email || '')}`);
      return;
    }

    // Extract email from error message
    if (error?.includes("Unverified email:")) {
      const email = error.split(":")[1]?.trim();
      if (email) {
        router.replace(`/verify-email?email=${encodeURIComponent(email)}`);
      }
    }
  }, [error, callbackUrl, router, searchParams]);

  // Show loading state for verification redirects
  if (callbackUrl?.includes("/verify-email") || error?.toLowerCase().includes("verify") || error?.includes("Unverified email:")) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Email Verification Required</h1>
          <p className="text-gray-600">Redirecting to verification page...</p>
        </div>
      </div>
    );
  }

  const errorMessages = {
    "Signin": {
      title: "Sign In Error",
      message: "There was an error signing in. Please try again.",
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

  const errorConfig = error ? errorMessages[error as keyof typeof errorMessages] || errorMessages.default : errorMessages.default;

  let errorMessage = "An error occurred during authentication"

  switch (error) {
    case "Signin":
      errorMessage = "Try signing in with a different account."
      break
    case "OAuthSignin":
      errorMessage = "Try signing in with a different account."
      break
    case "OAuthCallback":
      errorMessage = "Try signing in with a different account."
      break
    case "OAuthCreateAccount":
      errorMessage = "Try signing in with a different account."
      break
    case "EmailCreateAccount":
      errorMessage = "Try signing in with a different account."
      break
    case "Callback":
      errorMessage = "Try signing in with a different account."
      break
    case "OAuthAccountNotLinked":
      errorMessage = "To confirm your identity, sign in with the same account you used originally."
      break
    case "EmailSignin":
      errorMessage = "Check your email address."
      break
    case "CredentialsSignin":
      errorMessage = "Invalid email or password. Please try again."
      break
    case "SessionRequired":
      errorMessage = "Please sign in to access this page."
      break
    default:
      errorMessage = "Unable to sign in. Please try again."
      break
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Authentication Error
          </h1>
          <p className="text-sm text-muted-foreground">
            {errorMessage}
          </p>
        </div>
        <Button asChild>
          <Link href="/sign-in">
            Try Again
          </Link>
        </Button>
      </div>
    </div>
  );
}
