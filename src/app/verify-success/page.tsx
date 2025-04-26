import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import Link from "next/link"

export default function VerifySuccessPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[360px]">
        <div className="flex flex-col space-y-2 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">
            Email Verified Successfully
          </h1>
          <p className="text-sm text-muted-foreground px-6">
            Your email has been verified. You can now sign in to your account.
          </p>
        </div>

        <Button asChild>
          <Link href="/sign-in">
            Sign In
          </Link>
        </Button>
      </div>
    </div>
  )
}
