"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, Clock, CreditCard, User, Calendar, XCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface Earning {
  _id: string
  teacherId: { _id: string; name: string; email: string }
  sessionId: string
  hours: number
  amount: number
  date: string
  status: "pending" | "paid"
  paidAt?: string
}

export default function AdminEarningsPage() {
  const [earnings, setEarnings] = useState<Earning[]>([])
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState<string | null>(null)
  const [payModal, setPayModal] = useState<{ open: boolean; earning: Earning | null }>({ open: false, earning: null })

  useEffect(() => {
    async function fetchEarnings() {
      setLoading(true)
      const res = await fetch("/api/earnings/admin")
      const data = res.ok ? await res.json() : []
      setEarnings(data)
      setLoading(false)
    }
    fetchEarnings()
  }, [])

  const openPayModal = (earning: Earning) => setPayModal({ open: true, earning })
  const closePayModal = () => setPayModal({ open: false, earning: null })

  const handlePay = async () => {
    if (!payModal.earning) return
    setPaying(payModal.earning._id)
    const res = await fetch(`/api/earnings/${payModal.earning._id}/pay`, { method: "POST" })
    if (res.ok) {
      setEarnings(earnings =>
        earnings.map(e =>
          e._id === payModal.earning!._id ? { ...e, status: "paid", paidAt: new Date().toISOString() } : e
        )
      )
      closePayModal()
    }
    setPaying(null)
  }

  // Summary stats
  const total = earnings.reduce((sum, e) => sum + e.amount, 0)
  const paid = earnings.filter(e => e.status === "paid").reduce((sum, e) => sum + e.amount, 0)
  const pending = earnings.filter(e => e.status === "pending").reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="max-w-5xl mx-auto py-10 px-2 sm:px-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-primary">Teacher Earnings</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 flex flex-col items-center bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow">
          <CreditCard className="h-8 w-8 text-green-600 mb-2" />
          <div className="text-sm text-muted-foreground">Total Earnings</div>
          <div className="text-2xl font-bold text-green-700 mt-1">₦{total.toLocaleString()}</div>
        </Card>
        <Card className="p-6 flex flex-col items-center bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow">
          <CheckCircle className="h-8 w-8 text-blue-600 mb-2" />
          <div className="text-sm text-muted-foreground">Paid</div>
          <div className="text-2xl font-bold text-blue-700 mt-1">₦{paid.toLocaleString()}</div>
        </Card>
        <Card className="p-6 flex flex-col items-center bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 shadow">
          <Clock className="h-8 w-8 text-yellow-600 mb-2" />
          <div className="text-sm text-muted-foreground">Pending</div>
          <div className="text-2xl font-bold text-yellow-700 mt-1">₦{pending.toLocaleString()}</div>
        </Card>
      </div>
      <h2 className="text-lg font-semibold mb-4">Earning History</h2>
      {loading ? (
        <div className="flex items-center gap-2 justify-center py-16">
          <Loader2 className="animate-spin" /> Loading...
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="min-w-full border rounded bg-white">
            <thead>
              <tr className="bg-muted">
                <th className="px-3 py-2 text-left">Teacher</th>
                <th className="px-3 py-2 text-left">Email</th>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-center">Hours</th>
                <th className="px-3 py-2 text-center">Amount</th>
                <th className="px-3 py-2 text-center">Status</th>
                <th className="px-3 py-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {earnings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground">
                    No earnings found.
                  </td>
                </tr>
              ) : (
                earnings.map(e => (
                  <tr key={e._id} className="border-b">
                    <td className="px-3 py-2">{e.teacherId?.name || e.teacherId?._id}</td>
                    <td className="px-3 py-2">{e.teacherId?.email}</td>
                    <td className="px-3 py-2">{new Date(e.date).toLocaleDateString()}</td>
                    <td className="px-3 py-2 text-center">{e.hours}</td>
                    <td className="px-3 py-2 text-center font-semibold text-green-700">₦{e.amount.toLocaleString()}</td>
                    <td className="px-3 py-2 text-center">
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
                    <td className="px-3 py-2 text-center">
                      {e.status === "pending" && (
                        <Button
                          size="sm"
                          onClick={() => openPayModal(e)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Pay
                        </Button>
                      )}
                      {e.status === "paid" && (
                        <span className="text-green-600 font-semibold text-sm flex items-center gap-1">
                          Paid
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

      {/* Pay Modal */}
      <Dialog open={payModal.open} onOpenChange={closePayModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Mark as Paid</DialogTitle>
          </DialogHeader>
          {payModal.earning && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-500" />
                <span className="font-medium">{payModal.earning.teacherId?.name}</span>
                <span className="text-xs text-muted-foreground ml-2">{payModal.earning.teacherId?.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-500" />
                <span>{new Date(payModal.earning.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-700 text-lg">₦{payModal.earning.amount.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground ml-2">{payModal.earning.hours} hour(s)</span>
              </div>
              <div className="flex items-center gap-2">
                {payModal.earning.status === "pending" ? (
                  <span className="inline-flex items-center gap-1 text-yellow-600 font-medium">
                    <Clock className="h-4 w-4" /> Pending
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                    <CheckCircle className="h-4 w-4" /> Paid
                  </span>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closePayModal} disabled={paying !== null}>
              Cancel
            </Button>
            <Button
              onClick={handlePay}
              disabled={paying !== null}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {paying ? "Paying..." : "Confirm Pay"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
