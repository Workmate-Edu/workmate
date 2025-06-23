"use client"

import { useState } from "react"
import { Card } from "./ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { calculateTutorialCost, formatAmount } from "@/lib/flutterwave"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useToast } from "./ui/use-toast"

const STEM_SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
]

const LANGUAGE_SUBJECTS = [
  "English",
  "Yoruba",
  "Igbo",
  "Hausa",
  "Swahili",
  "Arabic",
]

interface SubjectConfig {
  subject: string
  numberOfStudents: number
  hoursPerSession: number
  sessionsPerWeek: number
}

export function PricingCalculator() {
  const [isLoading, setIsLoading] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
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

  const handleConfigChange = (
    subject: string,
    field: keyof SubjectConfig,
    value: number
  ) => {
    setSelectedSubjects((prev) =>
      prev.map((s) =>
        s.subject === subject ? { ...s, [field]: value } : s
      )
    )
  }

  const hourlyRate = 5 // $5 per hour per student
  const totalCost = selectedSubjects.reduce(
    (sum, s) => sum + calculateTutorialCost(hourlyRate, s.numberOfStudents, s.hoursPerSession, s.sessionsPerWeek),
    0
  )

  const handlePayment = async () => {
    if (!session) {
      router.push("/sign-in")
      return
    }
    if (selectedSubjects.length === 0) {
      toast({
        title: "Select at least one subject",
        variant: "destructive",
      })
      return
    }
    try {
      setIsLoading(true)
      const config = {
        public_key: process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY!,
        tx_ref: Date.now().toString(),
        amount: totalCost,
        currency: "USD",
        payment_options: "card",
        meta: {
          userId: session.user.id,
          subjects: selectedSubjects,
        },
        customer: {
          email: session.user.email!,
          name: session.user.name!,
        },
        customizations: {
          title: "Workmate Tutorial Session",
          description: "Payment for tutorial sessions",
          logo: `${window.location.origin}/logo.png`,
        },
        callback: function (response: any) {
          if (response.status === "successful") {
            router.push("/payment/success")
          } else {
            router.push("/payment/failed")
          }
        },
        onclose: function () {
          setIsLoading(false)
        },
      }
      console.log('Flutterwave config:', config)
      window.FlutterwaveCheckout(config)
    } catch (error) {
      toast({
        title: "Payment Error",
        description:
          error instanceof Error ? error.message : "Failed to process payment",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <Card className="p-6 md:p-8 border-primary/20">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Calculate Your Plan</h2>
          <p className="text-sm text-muted-foreground">
            Customize your learning plan based on your needs
          </p>
        </div>
        <div>
          <label className="block font-medium mb-2">Select Subjects</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           
            <div>
              <div className="font-semibold mb-2">Languages</div>
              <div className="space-y-2">
                {LANGUAGE_SUBJECTS.map(subject => (
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
             <div>
              <div className="font-semibold mb-2">STEM</div>
              <div className="space-y-2">
                {STEM_SUBJECTS.map(subject => (
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
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={s.numberOfStudents}
                      onChange={e => handleConfigChange(s.subject, 'numberOfStudents', Number(e.target.value))}
                      className="w-24"
                    />
                  </div>
                  <div>
                    <label className="block text-sm">Hours/Session</label>
                    <Input
                      type="number"
                      min={1}
                      max={4}
                      value={s.hoursPerSession}
                      onChange={e => handleConfigChange(s.subject, 'hoursPerSession', Number(e.target.value))}
                      className="w-24"
                    />
                  </div>
                  <div>
                    <label className="block text-sm">Sessions/Week</label>
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      value={s.sessionsPerWeek}
                      onChange={e => handleConfigChange(s.subject, 'sessionsPerWeek', Number(e.target.value))}
                      className="w-24"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="bg-primary/5 p-6 rounded-lg space-y-4">
          <div className="flex justify-between items-baseline text-sm">
            <span>Base rate per hour</span>
            <span className="font-medium">${hourlyRate}</span>
          </div>
          <div className="pt-4 border-t">
            <div className="flex justify-between items-baseline">
              <span className="text-lg font-medium">Weekly Total</span>
              <span className="text-3xl font-bold">${totalCost}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Billed weekly. Cancel anytime.
            </p>
          </div>
        </div>
        <Button
          size="lg"
          className="w-full"
          onClick={handlePayment}
          disabled={isLoading}
        >
          {isLoading
            ? "Processing..."
            : session
            ? "Get Started Now"
            : "Sign in to Continue"}
        </Button>
      </div>
    </Card>
  )
}
