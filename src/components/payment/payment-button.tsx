"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { calculateTutorialCost } from "@/lib/flutterwave"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

declare global {
  interface Window {
    FlutterwaveCheckout: any;
  }
}

interface PaymentButtonProps {
  numberOfStudents: number;
  hoursPerSession: number;
  sessionsPerWeek: number;
}

export function PaymentButton({ 
  numberOfStudents, 
  hoursPerSession, 
  sessionsPerWeek 
}: PaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const handlePayment = () => {
    if (!session?.user) {
      router.push('/sign-in')
      return
    }

    setIsLoading(true)
    const amount = calculateTutorialCost(5, numberOfStudents, hoursPerSession, sessionsPerWeek)

    try {
      window.FlutterwaveCheckout({
        public_key: process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY!,
        tx_ref: Date.now().toString(),
        amount,
        currency: 'USD',
        payment_options: 'card',
        meta: {
          userId: session.user.id,
          // If you have subjects, use: subjects: subjects.join(', ')
        },
        customer: {
          email: session.user.email!,
          name: session.user.name!,
        },
        customizations: {
          title: 'Workmate Tutorial Session',
          description: 'Payment for tutorial session',
          logo: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
        },
        redirect_url: `${window.location.origin}/payment/verify`
        // No callback, no onclose
      })
    } catch (error) {
      setIsLoading(false)
      toast({
        title: "Error",
        description: "Failed to initialize payment",
        variant: "destructive"
      })
    }
  }

  return (
    <Button 
      onClick={handlePayment} 
      disabled={isLoading}
      className="w-full"
    >
      {isLoading ? "Processing..." : "Get Started Now"}
    </Button>
  )
}
      onClick={handlePayment} 
      disabled={isLoading}
      className="w-full"
    >
      {isLoading ? "Processing..." : "Get Started Now"}
    </Button>
  )
}
