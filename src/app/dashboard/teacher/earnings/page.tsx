"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Loader2, CreditCard, Calendar, TrendingUp, CheckCircle, Clock } from "lucide-react"

interface Earning {
  _id: string
  hours: number
  amount: number
  date: string
  status: "pending" | "paid"
  paidAt?: string
}

export default function TeacherEarningsPage() {
  const [earnings, setEarnings] = useState<Earning[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [monthly, setMonthly] = useState(0)
  const [weekly, setWeekly] = useState(0)

  useEffect(() => {
    async function fetchEarnings() {
      setLoading(true)
      const res = await fetch("/api/earnings/teacher")
      const data = res.ok ? await res.json() : []
      setEarnings(data)
      setLoading(false)

      // Calculate totals
      const now = new Date()
      let totalSum = 0, monthSum = 0, weekSum = 0
      data.forEach((e: Earning) => {
        totalSum += e.amount
        const d = new Date(e.date)
        if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) monthSum += e.amount
        const weekAgo = new Date(now)
        weekAgo.setDate(now.getDate() - 7)
        if (d >= weekAgo) weekSum += e.amount
      })
      setTotal(totalSum)
      setMonthly(monthSum)
      setWeekly(weekSum)
    }
    fetchEarnings()
  }, [])

  return (
    <div className="max-w-3xl mx-auto py-10 px-2 sm:px-4">
      <h1 className="text-3xl font-bold mb-6 text-primary">My Earnings</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card className="p-6 flex flex-col items-center bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow">
          <CreditCard className="h-8 w-8 text-green-600 mb-2" />
          <div className="text-sm text-muted-foreground">Total Earnings</div>
          <div className="text-3xl font-bold text-green-700 mt-1">₦{total.toLocaleString()}</div>
        </Card>
        <Card className="p-6 flex flex-col items-center bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow">
          <Calendar className="h-8 w-8 text-blue-600 mb-2" />
          <div className="text-sm text-muted-foreground">This Month</div>
          <div className="text-3xl font-bold text-blue-700 mt-1">₦{monthly.toLocaleString()}</div>
        </Card>
        <Card className="p-6 flex flex-col items-center bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 shadow">
          <TrendingUp className="h-8 w-8 text-yellow-600 mb-2" />
          <div className="text-sm text-muted-foreground">This Week</div>
          <div className="text-3xl font-bold text-yellow-700 mt-1">₦{weekly.toLocaleString()}</div>
        </Card>
      </div>
      <h2 className="text-lg font-semibold mb-4">Earning History</h2>
      {loading ? (
        <div className="flex items-center gap-2"><Loader2 className="animate-spin" /> Loading...</div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="min-w-full border rounded bg-white">
            <thead>
              <tr className="bg-muted">
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Hours</th>
                <th className="px-4 py-2 text-left">Amount</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {earnings.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-muted-foreground">
                    No earnings yet.
                  </td>
                </tr>
              ) : (
                earnings.map(e => (
                  <tr key={e._id} className="border-b hover:bg-muted/40 transition">
                    <td className="px-4 py-2">{new Date(e.date).toLocaleDateString()}</td>
                    <td className="px-4 py-2">{e.hours}</td>
                    <td className="px-4 py-2 font-semibold text-green-700">₦{e.amount.toLocaleString()}</td>
                    <td className="px-4 py-2">
                      {e.status === "paid" ? (
                        <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                          <CheckCircle className="h-4 w-4" /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-yellow-600 font-medium">
                          <Clock className="h-4 w-4" /> Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
