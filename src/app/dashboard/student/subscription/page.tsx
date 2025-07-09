"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, User } from "lucide-react"
import { useSession } from "next-auth/react"

interface SubjectConfig {
  subject: string
  childId?: string
}

interface Subscription {
  status: string
  plan: string
  startDate: string
  endDate: string
  lastPayment: string
  subjects?: SubjectConfig[]
}

export default function StudentSubscriptionPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()

  useEffect(() => {
    async function fetchSubscription() {
      setLoading(true)
      try {
        const res = await fetch("/api/subscription/status")
        const data = await res.json()
        setSubscription(data.subscription)
      } catch {
        setSubscription(null)
      } finally {
        setLoading(false)
      }
    }
    fetchSubscription()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin w-8 h-8 text-muted-foreground" />
      </div>
    )
  }

  if (!subscription) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">No Subscription Found</h2>
        <p className="text-muted-foreground">You do not have an active subscription.</p>
      </Card>
    )
  }

  return (
    <Card className="p-8 max-w-2xl mx-auto shadow-lg border border-primary/20 bg-gradient-to-br from-background via-white/80 to-primary/10">
      <div className="flex items-center gap-4 mb-6">
        <Badge
          variant={subscription.status === "active" ? "default" : "secondary"}
          className="text-base px-4 py-1"
        >
          {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
        </Badge>
        <span className="text-lg font-semibold text-primary">{subscription.plan} plan</span>
      </div>
      <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium">Start Date:</span>
          <div>{new Date(subscription.startDate).toLocaleDateString()}</div>
        </div>
        <div>
          <span className="font-medium">End Date:</span>
          <div>{new Date(subscription.endDate).toLocaleDateString()}</div>
        </div>
        <div>
          <span className="font-medium">Last Payment:</span>
          <div>{new Date(subscription.lastPayment).toLocaleDateString()}</div>
        </div>
      </div>
      <div className="mb-2">
        <span className="font-medium text-lg">Subscription Covers</span>
      </div>
      <div className="space-y-6">
        <div className="rounded-lg bg-primary/5 p-4">
          <div className="flex items-center gap-2 mb-1">
            <User className="w-4 h-4 text-primary" />
            <span className="font-semibold text-base">Student</span>
            <Badge variant="outline" className="ml-2">{session?.user?.name || "You"}</Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Subjects:</span>{" "}
            {subscription.subjects && subscription.subjects.length > 0
              ? subscription.subjects.map(s => s.subject).join(", ")
              : "None"}
          </div>
        </div>
      </div>
    </Card>
  )
}
