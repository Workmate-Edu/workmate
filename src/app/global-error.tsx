'use client'
 
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"
 
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
          <div className="mx-auto w-full max-w-md space-y-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="rounded-full bg-muted p-3">
                <AlertTriangle className="h-12 w-12 text-red-500" />
              </div>
              
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight">
                  Oops! Something Went Wrong
                </h1>
                <p className="text-sm text-muted-foreground">
                  We're experiencing technical difficulties. Our team has been notified and is working to fix this issue.
                </p>
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-4 p-4 bg-muted rounded-lg text-left">
                    <p className="text-xs font-mono text-muted-foreground">
                      {error.message}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <Button onClick={() => reset()}>
                Try Again
              </Button>
              
              <Button asChild variant="outline">
                <Link href="/">
                  Go to Homepage
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
