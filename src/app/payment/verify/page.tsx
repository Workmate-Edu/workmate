"use client"

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function VerifyPaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const status = searchParams.get('status')
    const transaction_id = searchParams.get('transaction_id')

    if (!status || !transaction_id) {
      router.replace('/payment/failed')
      return
    }

    // Always verify transaction on your server here for reliability
    fetch(`/api/payment/verify?transaction_id=${transaction_id}&status=${status}`)
      .then(() => {
        if (status === 'successful') {
          router.replace('/payment/success')
        } else {
          router.replace('/payment/failed')
        }
      })
      .catch(() => {
        router.replace('/payment/failed')
      })
  }, [router, searchParams])

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p>Verifying your payment...</p>
      </div>
    </div>
  )
}
