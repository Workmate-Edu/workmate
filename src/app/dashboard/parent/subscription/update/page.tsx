"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { PricingCalculator } from "@/components/pricing-calculator"
import { Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

export default function SubscriptionUpdatePage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [daysLeft, setDaysLeft] = useState<number>(0)
  const [subscription, setSubscription] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchSubscription() {
      setLoading(true)
      try {
        const res = await fetch("/api/subscription/status")
        const data = await res.json()
        setSubscription(data.subscription)
        if (data.subscription?.endDate) {
          const left = Math.max(
            0,
            Math.ceil(
              (new Date(data.subscription.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            )
          )
          setDaysLeft(left)
        }
      } catch {
        setSubscription(null)
        setDaysLeft(0)
      } finally {
        setLoading(false)
      }
    }
    fetchSubscription()
  }, [])

  if (loading || status === "loading") {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin w-8 h-8 text-muted-foreground" />
      </div>
    )
  }

  if (!session) {
    router.push("/sign-in")
    return null
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      {/* Back button */}
      <div className="mb-4">
        <button
          type="button"
          className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded border border-border bg-background hover:bg-muted transition"
          onClick={() => router.push("/dashboard/parent/subscription")}
        >
          {/* Left arrow icon */}
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Subscription
        </button>
      </div>
      <Card className="p-6 md:p-8 mb-8">
        <h2 className="text-2xl font-bold mb-2">Update or Renew Subscription</h2>
        <p className="text-muted-foreground mb-4">
          Change your plan, add new subjects or children, or renew your subscription.
        </p>
        {subscription && daysLeft > 0 && (
          <Alert variant="info" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You have {daysLeft} day{daysLeft > 1 ? "s" : ""} left on your current subscription. When you renew, the new subscription will extend your access by the selected plan duration plus your remaining days.
            </AlertDescription>
          </Alert>
        )}
        <PricingCalculator daysLeft={daysLeft} />
      </Card>
    </div>
  )
}
