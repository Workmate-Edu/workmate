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

    // The server owns the outcome. Fetching a redirect and then trusting the
    // browser's status could show success even when verification failed.
    const query = new URLSearchParams({ transaction_id, status });
    window.location.replace(`/api/payment/verify?${query.toString()}`)
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
