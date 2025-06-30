"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { calculateTutorialCost, generatePaymentRef } from "@/lib/flutterwave"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { usePayment } from "@/providers/payment-provider"
import { Loader2 } from "lucide-react"

const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Yoruba",
  "Igbo",
  "Hausa",
  "Swahili",
  "French",
]

interface SubjectConfig {
  subject: string;
  numberOfStudents: number;
  hoursPerSession: number;
  sessionsPerWeek: number;
}

export function PaymentForm() {
  const [isLoading, setIsLoading] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const { isFlutterwaveReady } = usePayment()
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectConfig[]>([])

  const handleSubjectToggle = (subject: string) => {
    setSelectedSubjects((prev) => {
      if (prev.find((s) => s.subject === subject)) {
        return prev.filter((s) => s.subject !== subject)
      } else {
        return [
          ...prev,
          {
            subject,
            numberOfStudents: 1,
            hoursPerSession: 1,
            sessionsPerWeek: 1,
          },
        ]
      }
    })
  }

  const handleConfigChange = (subject: string, field: keyof SubjectConfig, value: number) => {
    setSelectedSubjects((prev) =>
      prev.map((s) =>
        s.subject === subject ? { ...s, [field]: value } : s
      )
    )
  }

  const totalAmount = selectedSubjects.reduce(
    (sum, s) => sum + calculateTutorialCost(5, s.numberOfStudents, s.hoursPerSession, s.sessionsPerWeek),
    0
  )

  const handlePayment = async () => {
    if (!session?.user) {
      router.push('/sign-in')
      return
    }
    if (!isFlutterwaveReady) {
      toast({
        title: "Error",
        description: "Payment system is initializing. Please try again.",
        variant: "destructive"
      })
      return
    }
    if (selectedSubjects.length === 0) {
      toast({
        title: "Select at least one subject",
        variant: "destructive"
      })
      return
    }
    try {
      setIsLoading(true)
      const config = {
        public_key: process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY!,
        tx_ref: generatePaymentRef(),
        amount: totalAmount,
        currency: 'USD',
        payment_options: 'card',
        meta: {
          userId: session.user.id,
          subjects: selectedSubjects.map(s => s.subject).join(', '), // Ensure string
        },
        customer: {
          email: session.user.email!,
          name: session.user.name!,
        },
        customizations: {
          title: 'Workmate Tutorial Session',
          description: 'Payment for tutorial sessions',
          logo: `${window.location.origin}/logo.png`,
        },
        redirect_url: `${window.location.origin}/payment/verify`
        // No callback, no onclose
      }
      window.FlutterwaveCheckout(config)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initialize payment",
        variant: "destructive"
      })
      setIsLoading(false)
    }
  }

  if (!isFlutterwaveReady) {
    return (
      <Button disabled className="w-full">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Initializing payment...
      </Button>
    )
  }

  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        handlePayment()
      }}
      className="space-y-6"
    >
      <div>
        <label className="block font-medium mb-2">Select Subjects</label>
        <div className="grid grid-cols-2 gap-2">
          {SUBJECTS.map(subject => (
            <label key={subject} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedSubjects.some(s => s.subject === subject)}
                onChange={() => handleSubjectToggle(subject)}
              />
              {subject}
            </label>
          ))}
        </div>
      </div>
      {selectedSubjects.length > 0 && (
        <div className="space-y-6">
          {selectedSubjects.map((s) => (
            <div key={s.subject} className="border rounded-lg p-4">
              <div className="font-semibold mb-2">{s.subject}</div>
              <div className="flex flex-wrap gap-4">
                <div>
                  <label className="block text-sm">Students</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={s.numberOfStudents}
                    onChange={e => handleConfigChange(s.subject, 'numberOfStudents', Number(e.target.value))}
                    className="border rounded px-2 py-1 w-20"
                  />
                </div>
                <div>
                  <label className="block text-sm">Hours/Session</label>
                  <input
                    type="number"
                    min={1}
                    max={4}
                    value={s.hoursPerSession}
                    onChange={e => handleConfigChange(s.subject, 'hoursPerSession', Number(e.target.value))}
                    className="border rounded px-2 py-1 w-20"
                  />
                </div>
                <div>
                  <label className="block text-sm">Sessions/Week</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={s.sessionsPerWeek}
                    onChange={e => handleConfigChange(s.subject, 'sessionsPerWeek', Number(e.target.value))}
                    className="border rounded px-2 py-1 w-20"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="font-semibold text-lg">Total: ${totalAmount}</div>
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? "Processing..." : session ? "Proceed to Payment" : "Sign in to Continue"}
      </Button>
    </form>
  )
}