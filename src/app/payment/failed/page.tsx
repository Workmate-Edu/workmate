import { Button } from "@/components/ui/button"
import { XCircle } from "lucide-react"
import Link from "next/link"

export default function PaymentFailedPage() {
  return (
    <div className="container max-w-lg py-12 md:py-24">
      <div className="text-center space-y-6">
        <XCircle className="h-16 w-16 text-red-500 mx-auto" />
        <h1 className="text-2xl font-bold">Payment Failed</h1>
        <p className="text-muted-foreground">
          Something went wrong with your payment. Please try again or contact support.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/pricing">
            <Button>Try Again</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
