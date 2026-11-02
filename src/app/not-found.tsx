import Link from "next/link";
import { Home, LayoutDashboard } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <section
      aria-labelledby="not-found-title"
      className="relative isolate flex min-h-[65vh] items-center justify-center overflow-hidden px-4 py-20 sm:py-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-secondary/5 via-background to-primary/5"
      />
      <div className="mx-auto w-full max-w-xl text-center">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <p className="text-7xl font-extrabold tracking-tight text-secondary sm:text-8xl">
          <span className="sr-only">Error </span>404
        </p>
        <h1
          id="not-found-title"
          className="mt-5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
        >
          This page could not be found.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-7 text-muted-foreground">
          The link may be out of date, or the page may have moved. Let’s get you
          back to learning with Workmate.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/">
              <Home aria-hidden="true" className="mr-2 h-4 w-4" />
              Back to home
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/dashboard">
              <LayoutDashboard aria-hidden="true" className="mr-2 h-4 w-4" />
              Go to dashboard
            </Link>
          </Button>
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          Need a hand?{" "}
          <Link
            href="/contact"
            className="font-medium text-secondary underline underline-offset-4 hover:text-secondary/80"
          >
            Contact us
          </Link>
        </p>
      </div>
    </section>
  );
}
