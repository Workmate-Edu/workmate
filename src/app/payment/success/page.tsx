"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

export default function PaymentSuccessPage() {
  const { data: session } = useSession()
  const userRole = session?.user?.role
  const userId = session?.user?.id
  const [meta, setMeta] = useState<{ hasParent: boolean; hasChildren: boolean } | null>(null)
  const [loading, setLoading] = useState(userRole === "parent")

  useEffect(() => {
    // Fetch latest transaction for this user to check meta.subjects
    async function fetchTransactionMeta() {
      if (userRole !== "parent" || !userId) return
      setLoading(true)
      try {
        const res = await fetch(`/api/transactions/latest?userId=${userId}`)
        const data = await res.json()
        if (data?.transaction?.meta?.subjects) {
          let subjects = []
          try {
            subjects = JSON.parse(data.transaction.meta.subjects)
          } catch {
            subjects = []
          }
          const hasParent = subjects.some((s: any) => s.childId === userId)
          const hasChildren = subjects.some((s: any) => s.childId && s.childId !== userId)
          setMeta({ hasParent, hasChildren })
        } else {
          setMeta(null)
        }
      } catch {
        setMeta(null)
      }
      setLoading(false)
    }
    fetchTransactionMeta()
  }, [userRole, userId])

  let message = "Your tutorial session has been confirmed. Check your email for details."
  if (userRole === "parent") {
    if (loading) {
      message = "Loading your payment details..."
    } else if (meta) {
      if (meta.hasParent && meta.hasChildren) {
        message =
          "Your payment was successful! Your learning journey is now active and your children's tutorial sessions have been confirmed. Check your email for details and next steps for you and your children."
      } else if (meta.hasParent) {
        message =
          "Your payment was successful! Your learning journey is now active. Check your email for details and next steps."
      } else if (meta.hasChildren) {
        message =
          "Your payment was successful! Your children's tutorial sessions have been confirmed. Check your email for details and next steps for your children."
      } else {
        message =
          "Your payment was successful! If you selected subjects for yourself, your learning journey is now active. If you selected for your children, their tutorial sessions have been confirmed. Check your email for details and next steps for you and/or your children."
      }
    } else {
      message =
        "Your payment was successful! If you selected subjects for yourself, your learning journey is now active. If you selected for your children, their tutorial sessions have been confirmed. Check your email for details and next steps for you and/or your children."
    }
  }

  return (
    <div className="container max-w-lg py-12 md:py-24">
      <div className="text-center space-y-6">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
        <h1 className="text-2xl font-bold">Payment Successful!</h1>
        <p className="text-muted-foreground">{message}</p>
        <div className="flex justify-center gap-4">
          <Link href="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
