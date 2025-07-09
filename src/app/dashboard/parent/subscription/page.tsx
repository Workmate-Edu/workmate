"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, User, Users, AlertTriangle } from "lucide-react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert } from "@/components/ui/alert"
import { useSearchParams } from "next/navigation"

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
  children?: string[]
  subjects?: SubjectConfig[]
}

interface Child {
  id: string
  name: string
}

export default function ParentSubscriptionPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [children, setChildren] = useState<Child[]>([])
  const [showDowngradeModal, setShowDowngradeModal] = useState(false)
  const { data: session } = useSession()
  const searchParams = useSearchParams()

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

  useEffect(() => {
    async function fetchChildren() {
      try {
        const res = await fetch("/api/parent/children")
        const data = await res.json()
        setChildren(data.children || [])
      } catch {
        setChildren([])
      }
    }
    fetchChildren()
  }, [])

  useEffect(() => {
    if (searchParams?.get("reason") === "downgrade") {
      setShowDowngradeModal(true)
    }
  }, [searchParams])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin w-8 h-8 text-muted-foreground" />
      </div>
    )
  }

  if (!subscription) {
    return (
      <div>
        <Card className="p-8 text-center mb-8">
          <h2 className="text-xl font-semibold mb-2">No Subscription Found</h2>
          <p className="text-muted-foreground mb-4">You do not have an active subscription.</p>
          <Button asChild>
            <Link href="/dashboard/parent/subscription/update">
              Subscribe Now
            </Link>
          </Button>
        </Card>
      </div>
    )
  }

  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(subscription.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
  )

  const childIdToName = (id: string) =>
    children.find((c) => c.id === id)?.name || id

  const parentId = session?.user?.id
  const grouped: Record<string, string[]> = {}
  subscription.subjects?.forEach((s) => {
    const key = s.childId || parentId || "parent"
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(s.subject)
  })

  return (
    <div>
      {/* Downgrade Blocked Modal */}
      <Dialog open={showDowngradeModal} onOpenChange={setShowDowngradeModal}>
        <DialogContent className="max-w-lg w-full">
          <DialogHeader>
            <DialogTitle>Plan Downgrade Blocked</DialogTitle>
          </DialogHeader>
          <div className="py-2 flex flex-col items-center">
            {/* SVG caution icon centered */}
            <div className="flex justify-center w-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mb-3 text-yellow-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <p className="mb-2 font-medium text-center">
              You cannot downgrade your subscription plan for the following subjects/children until your current plan expires:
            </p>
            <ul className="list-disc list-inside mb-2 text-sm text-muted-foreground">
              {subscription?.subjects?.map((s, idx) => {
                const isParent = !s.childId || s.childId === (session?.user?.id ?? "")
                const childName = isParent
                  ? "Parent"
                  : children.find((c) => c.id === s.childId)?.name
                return (
                  <li key={s.subject + (s.childId || "")}>
                    {s.subject} {childName ? `(${childName})` : ""}
                  </li>
                )
              })}
            </ul>
            <p className="text-muted-foreground text-sm text-center">
              If you want to add new subjects or children, you may proceed with a new subscription for those only. For existing ones, please wait until your current plan ends.
            </p>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setShowDowngradeModal(false)}>OK</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="p-8 max-w-2xl mx-auto shadow-lg border border-primary/20 bg-gradient-to-br from-background via-white/80 to-primary/10 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Badge
                variant={subscription.status === "active" ? "default" : "secondary"}
                className="text-base px-4 py-1 font-semibold tracking-wide"
              >
                {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
              </Badge>
              <span className="text-lg font-bold text-primary tracking-tight">
                {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} plan
              </span>
            </div>
          </div>
          <Button asChild size="sm" variant="default" className="ml-0 sm:ml-4 font-semibold shadow-sm">
            <Link href="/dashboard/parent/subscription/update">
              Update / Renew Subscription
            </Link>
          </Button>
        </div>

        {/* 
          The top-level Start Date, End Date, Last Payment, and Children count
          are for the overall subscription (legacy/summary).
          You should keep them for a quick summary, but the per-subject dates below
          are the authoritative periods for each subject/child/parent.
          If you want to avoid confusion, you can add a note or visually separate the summary from the detailed per-subject periods.
        */}

        {/* Add summary note about overall period */}
        <div className="mb-2 text-xs text-muted-foreground italic">
          Overall subscription period (may differ for each subject/child below). See details below.
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
          <div>
            <span className="font-medium">Children:</span>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {subscription.children?.length || 0}
            </div>
          </div>
        </div>

        <div className="mb-2">
          <span className="font-medium text-lg">Subscription Covers</span>
        </div>

        <div className="space-y-6">
          {/* Parent */}
          {grouped[parentId || "parent"] && (
            <div className="rounded-lg bg-primary/5 p-4">
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-primary" />
                <span className="font-semibold text-base">Parent</span>
                <Badge variant="outline" className="ml-2">You</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Subjects:</span>{" "}
                {grouped[parentId || "parent"].join(", ")}
              </div>
              {/* Show per-subject dates for parent */}
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                {subscription.subjects
                  ?.filter(s => (s.childId || parentId) === (parentId || "parent"))
                  .map((s, idx) => (
                    <div key={s.subject + (s.childId || "")}>
                      <span className="font-medium">{s.subject}:</span>{" "}
                      {s.startDate && s.endDate
                        ? `${new Date(s.startDate).toLocaleDateString()} - ${new Date(s.endDate).toLocaleDateString()}`
                        : "No period info"}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Children */}
          {subscription.children?.map((childId) =>
            grouped[childId] ? (
              <div key={childId} className="rounded-lg bg-secondary/10 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-secondary" />
                  <span className="font-semibold text-base">Child</span>
                  <Badge variant="secondary" className="ml-2">{childIdToName(childId)}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Subjects:</span>{" "}
                  {grouped[childId].join(", ")}
                </div>
                {/* Show per-subject dates for this child */}
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {subscription.subjects
                    ?.filter(s => s.childId === childId)
                    .map((s, idx) => (
                      <div key={s.subject + (s.childId || "")}>
                        <span className="font-medium">{s.subject}:</span>{" "}
                        {s.startDate && s.endDate
                          ? `${new Date(s.startDate).toLocaleDateString()} - ${new Date(s.endDate).toLocaleDateString()}`
                          : "No period info"}
                      </div>
                    ))}
                </div>
              </div>
            ) : null
          )}
        </div>
      </Card>
    </div>
  )
}
