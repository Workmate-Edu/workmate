"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

function daysUntil(dateStr: string) {
  const now = new Date()
  const end = new Date(dateStr)
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return diff
}

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    fetch("/api/admin/subscriptions")
      .then(res => res.json())
      .then(data => setSubscriptions(data.subscriptions || []))
      .finally(() => setLoading(false))
  }, [])

  const handleSendEmail = async (subId: string, days: number) => {
    setSending(prev => ({ ...prev, [subId + days]: true }))
    try {
      const res = await fetch(`/api/admin/subscriptions/${subId}/notify?days=${days}`, { method: "POST" })
      if (!res.ok) throw new Error("Failed to send email")
      toast.success(`Notification sent for ${days} day(s) before expiry`)
    } catch (err) {
      toast.error("Failed to send notification")
    } finally {
      setSending(prev => ({ ...prev, [subId + days]: false }))
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">All Subscriptions</h1>
      {loading ? (
        <div className="p-8 text-center">Loading subscriptions...</div>
      ) : subscriptions.length === 0 ? (
        <Card className="p-8 text-center">No subscriptions found.</Card>
      ) : (
        <div className="space-y-4">
          {subscriptions.map(sub => {
            const daysLeft = daysUntil(sub.endDate)
            return (
              <Card key={sub._id} className="p-4 flex flex-col gap-2">
                <div className="flex flex-wrap gap-4 items-center">
                  <span className="font-semibold">{sub.userId?.name || "Unknown User"}</span>
                  <span className="text-xs text-muted-foreground">{sub.userId?.email}</span>
                  <Badge variant={sub.status === "active" ? "default" : "secondary"}>
                    {sub.status}
                  </Badge>
                  <span className="text-xs">Plan: {sub.plan}</span>
                  <span className="text-xs">
                    {new Date(sub.startDate).toLocaleDateString()} - {new Date(sub.endDate).toLocaleDateString()}
                  </span>
                  <span className="text-xs">Children: {sub.children?.length || 0}</span>
                  <span className="text-xs">
                    {daysLeft >= 0 ? `${daysLeft} day(s) left` : "Expired"}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Subjects: {Array.isArray(sub.subjects) ? sub.subjects.map((s: any) => s.subject).join(", ") : ""}
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {[7, 3, 1].map(days => (
                    <Button
                      key={days}
                      size="sm"
                      variant="outline"
                      disabled={
                        // Enable 7 days button for testing, regardless of daysLeft
                        days === 7
                          ? false
                          : daysLeft !== days ||
                            sending[sub._id + days] ||
                            ([7, 3, 1].some(d => d > days && sending[sub._id + d]) || daysLeft < days)
                      }
                      onClick={() => handleSendEmail(sub._id, days)}
                    >
                      {sending[sub._id + days]
                        ? "Sending..."
                        : `Send ${days} day${days > 1 ? "s" : ""} notice`}
                    </Button>
                  ))}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
