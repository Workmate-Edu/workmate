"use client"

import { createContext, useContext, useEffect, useState } from 'react'

interface PaymentContextType {
  isFlutterwaveReady: boolean
}

const PaymentContext = createContext<PaymentContextType>({ isFlutterwaveReady: false })

export function PaymentProvider({ children }: { children: React.ReactNode }) {
  const [isFlutterwaveReady, setIsFlutterwaveReady] = useState(false)

  useEffect(() => {
    if (window.FlutterwaveCheckout) {
      setIsFlutterwaveReady(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.flutterwave.com/v3.js'
    script.async = true
    script.onload = () => setIsFlutterwaveReady(true)
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  return (
    <PaymentContext.Provider value={{ isFlutterwaveReady }}>
      {children}
    </PaymentContext.Provider>
  )
}

export const usePayment = () => useContext(PaymentContext)
