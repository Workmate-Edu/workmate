"use client"

import { useState, useEffect } from "react"
import { Card } from "./ui/card"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { calculateTutorialCost } from "@/lib/flutterwave"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useToast } from "./ui/use-toast"
import { cn } from "@/lib/utils"

const STEM_SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
]

const LANGUAGE_SUBJECTS = [
  "English",
  "Yoruba",
  "Igbo",
  "Hausa",
  "Swahili",
  "Arabic",
]

const PLAN_OPTIONS = [
  { value: "weekly", label: "Weekly", multiplier: 1, display: "Weekly", discount: 0 },
  { value: "monthly", label: "Monthly", multiplier: 4, display: "Monthly (4 weeks)", discount: 0.15 }, // 15% discount
  { value: "quarterly", label: "Quarterly", multiplier: 12, display: "Quarterly (12 weeks)", discount: 0.20 } // 20% discount
]

interface SubjectConfig {
  subject: string
  numberOfStudents: number
  hoursPerSession: number
  sessionsPerWeek: number
  childId?: string // for per-child subject selection
}

interface PricingCalculatorProps {
  daysLeft?: number
}

export function PricingCalculator({ daysLeft = 0 }: PricingCalculatorProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [children, setChildren] = useState<{ id: string; name: string }[]>([])
  const [isLoadingChildren, setIsLoadingChildren] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectConfig[]>([])
  const [selectedChildren, setSelectedChildren] = useState<string[]>([])
  const [selectedPlan, setSelectedPlan] = useState("weekly")

  // Add a flag for parent self-learning
  const [parentSelfLearning, setParentSelfLearning] = useState(false)
  const parentId = session?.user?.id

  const userRole = session?.user?.role
  const userName = session?.user?.name

  // Add state for downgrade modal
  const [showDowngradeModal, setShowDowngradeModal] = useState(false)
  const [blockedSubjects, setBlockedSubjects] = useState<any[]>([])

  // Helper for plan rank
  const planRank = { weekly: 1, monthly: 2, quarterly: 3 }
  const getRank = (plan: string) => planRank[plan] || 0

  useEffect(() => {
    if (userRole === "parent") {
      setIsLoadingChildren(true)
      fetch("/api/parent/children")
        .then(res => res.json())
        .then(data => {
          setChildren(Array.isArray(data.children) ? data.children.map((c: any) => ({
            id: c.id?.toString?.() ?? c._id?.toString?.() ?? "",
            name: c.name
          })) : [])
        })
        .catch(() => setChildren([]))
        .finally(() => setIsLoadingChildren(false))
    }
  }, [userRole])

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

  const handleChildToggle = (childId: string) => {
    setSelectedChildren((prev) =>
      prev.includes(childId)
        ? prev.filter((id) => id !== childId)
        : [...prev, childId]
    )
  }

  // For parent: allow subject selection per child
  const handleChildSubjectToggle = (childId: string, subject: string) => {
    setSelectedSubjects(prev => {
      const exists = prev.find(s => s.subject === subject && s.childId === childId)
      if (exists) {
        return prev.filter(s => !(s.subject === subject && s.childId === childId))
      } else {
        return [
          ...prev,
          {
            subject,
            numberOfStudents: 1,
            hoursPerSession: 1,
            sessionsPerWeek: 1,
            childId,
          },
        ]
      }
    })
  }

  // Update config for per-child subject
  const handleChildConfigChange = (
    childId: string,
    subject: string,
    field: keyof SubjectConfig,
    value: number
  ) => {
    setSelectedSubjects(prev =>
      prev.map(s =>
        s.subject === subject && s.childId === childId
          ? { ...s, [field]: value }
          : s
      )
    )
  }

  // Subject selection for parent (self)
  const handleParentSubjectToggle = (subject: string) => {
    setSelectedSubjects(prev => {
      const exists = prev.find(s => s.subject === subject && s.childId === parentId)
      if (exists) {
        return prev.filter(s => !(s.subject === subject && s.childId === parentId))
      } else {
        return [
          ...prev,
          {
            subject,
            numberOfStudents: 1,
            hoursPerSession: 1,
            sessionsPerWeek: 1,
            childId: parentId,
          },
        ]
      }
    })
  }

  const hourlyRate = 7.97 // $7.97 per hour per student

  const planObj = PLAN_OPTIONS.find(p => p.value === selectedPlan) || PLAN_OPTIONS[0]
  const planMultiplier = planObj.multiplier
  const planDiscount = planObj.discount

  // Calculate total cost: sum all selected subjects (children and parent) * plan multiplier, then apply discount
  const baseCost = selectedSubjects.reduce(
    (sum, s) =>
      sum +
      calculateTutorialCost(
        hourlyRate,
        s.numberOfStudents,
        s.hoursPerSession,
        s.sessionsPerWeek
      ),
    0
  ) * planMultiplier

  const discountAmount = baseCost * (planDiscount || 0)
  const totalCost = Math.round((baseCost - discountAmount) * 100) / 100

  // Downgrade check and payment handler
  const handlePayment = async (force = false) => {
    if (!session) {
      router.push("/sign-in")
      return
    }
    if (userRole === "parent") {
      const hasSubjectForChild = children.some(child =>
        selectedSubjects.some(s => s.childId === child.id)
      )
      const hasSubjectForParent = selectedSubjects.some(s => s.childId === parentId)
      if (!hasSubjectForChild && !hasSubjectForParent) {
        toast({
          title: "No subjects selected",
          description:
            "Please select at least one subject for yourself or for at least one child to continue. Use the checkboxes to choose subjects for your learning journey.",
          variant: "destructive",
        })
        return
      }
    } else {
      if (selectedSubjects.length === 0) {
        toast({
          title: "No subjects selected",
          description:
            "Please select at least one subject to continue. Use the checkboxes to choose your preferred subjects.",
          variant: "destructive",
        })
        return
      }
    }

    // Downgrade check (unless forced)
    if (!force) {
      try {
        const res = await fetch("/api/subscription/status")
        const { subscription } = await res.json()
        if (subscription) {
          const prevPlan = subscription.plan || "weekly"
          const prevPlanRank = getRank(prevPlan)
          const newPlanRank = getRank(selectedPlan)
          const blocked = selectedSubjects.filter((s: any) =>
            subscription.subjects?.some(
              (ps: any) =>
                ps.subject === s.subject &&
                (ps.childId || "") === (s.childId || "") &&
                newPlanRank < prevPlanRank
            )
          )
          if (blocked.length > 0) {
            setBlockedSubjects(blocked)
            setShowDowngradeModal(true)
            // Hide pricing modal by navigating away or using a callback if in a Dialog
            if (typeof window !== "undefined") {
              // If this component is inside a Dialog, try to close it
              const evt = new CustomEvent("closePricingDialog")
              window.dispatchEvent(evt)
            }
            return
          }
        }
      } catch (err) {
        // fallback: allow payment if check fails
      }
    }

    // --- Add daysLeft to new subscription if same subject/child is being renewed ---
    // This is already handled: daysLeft is passed to the backend for renewal extension logic.
    // The backend should add the remaining days to the new subscription if the user is renewing the same subject/child.
    // See: body: JSON.stringify({ ..., daysLeft, ... })

    try {
      setIsLoading(true)
      const response = await fetch("/api/payment/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalCost,
          plan: selectedPlan,
          subjects: selectedSubjects,
          children: userRole === "parent"
            ? Array.from(new Set(selectedSubjects.map(s => s.childId).filter(Boolean)))
            : undefined,
          daysLeft, // <-- this is passed to backend
        }),
      })

      const data = await response.json()
      if (!data.success) throw new Error(data.error)

      const paymentConfig = {
        public_key: process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY!,
        tx_ref: data.tx_ref,
        amount: totalCost,
        currency: "USD",
        payment_options: "card",
        meta: {
          userId: session.user.id,
          plan: selectedPlan,
          subjects: JSON.stringify(selectedSubjects),
          children: userRole === "parent"
            ? Array.from(new Set(selectedSubjects.map(s => s.childId).filter(Boolean))).join(",")
            : undefined,
          daysLeft,
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
        redirect_url: `${window.location.origin}/payment/verify`
      }
      window.FlutterwaveCheckout(paymentConfig)
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

  // Listen for closePricingDialog event if inside a Dialog
  useEffect(() => {
    const handler = () => {
      // If you use a Dialog from parent, you can call a prop/callback here to close it
      // For standalone usage, do nothing
    }
    window.addEventListener("closePricingDialog", handler)
    return () => window.removeEventListener("closePricingDialog", handler)
  }, [])

  return (
    <>
      {/* Downgrade protection modal - always rendered at top level */}
      {showDowngradeModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] bg-black/30">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
            {/* SVG caution icon centered */}
            <div className="flex justify-center w-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mb-3 text-yellow-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-4 text-center">Plan Downgrade Blocked</h3>
            <p className="text-sm text-muted-foreground mb-4 text-center">
              You cannot downgrade your subscription plan for the following subjects/children until your current plan expires:
            </p>
            <ul className="list-disc list-inside mb-4">
              {blockedSubjects.map((s, i) => {
                const childName = children.find(c => c.id === s.childId)?.name
                return (
                  <li key={s.subject + (s.childId || "")} className="text-sm">
                    {s.subject} {childName ? `(${childName})` : "(Parent)"}
                  </li>
                )
              })}
            </ul>
            <p className="text-sm text-muted-foreground mb-4 text-center">
              If you want to add new subjects or children, you may proceed with a new subscription for those only. For existing ones, please wait until your current plan ends.
            </p>
            <div className="flex justify-end">
              <Button
                onClick={() => setShowDowngradeModal(false)}
                className="flex-1"
              >
                OK
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Pricing Calculator Card */}
      {!showDowngradeModal && (
        <Card className="p-6 md:p-8 border-primary/20">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-2">
                {userName ? `Welcome, ${userName}!` : "Calculate Your Plan"}
              </h2>
              <p className="text-sm text-muted-foreground">
                Customize your learning plan based on your needs
              </p>
            </div>
            {/* Parent self-learning option */}
            {userRole === "parent" && (
              <div className="mb-6">
                {/* <label className="flex items-center gap-2 font-medium">
                  <input
                    type="checkbox"
                    checked={parentSelfLearning}
                    onChange={() => setParentSelfLearning(v => !v)}
                  />
                  I want to learn as a parent (Parent Learning Journey)
                </label> */}
                {parentSelfLearning && (
                  <div className="mt-4 border rounded-lg p-4">
                    <div className="font-semibold mb-2">Select Subjects for Yourself</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="font-semibold mb-2">Languages</div>
                        <div className="space-y-2">
                          {LANGUAGE_SUBJECTS.map(subject => (
                            <label key={subject} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={selectedSubjects.some(
                                  s => s.subject === subject && s.childId === parentId
                                )}
                                onChange={() => handleParentSubjectToggle(subject)}
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
                                checked={selectedSubjects.some(
                                  s => s.subject === subject && s.childId === parentId
                                )}
                                onChange={() => handleParentSubjectToggle(subject)}
                              />
                              {subject}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* Subject configs for parent */}
                    {selectedSubjects.filter(s => s.childId === parentId).length > 0 && (
                      <div className="space-y-4 mt-4">
                        {selectedSubjects
                          .filter(s => s.childId === parentId)
                          .map(s => (
                            <div key={s.subject} className="flex flex-wrap gap-4 items-center">
                              <div className="font-medium">{s.subject}</div>
                              <div>
                                <label className="block text-sm">Students</label>
                                <Input
                                  type="number"
                                  min={1}
                                  max={10}
                                  value={s.numberOfStudents}
                                  onChange={e =>
                                    handleChildConfigChange(
                                      parentId!,
                                      s.subject,
                                      "numberOfStudents",
                                      Number(e.target.value)
                                    )
                                  }
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
                                  onChange={e =>
                                    handleChildConfigChange(
                                      parentId!,
                                      s.subject,
                                      "hoursPerSession",
                                      Number(e.target.value)
                                    )
                                  }
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
                                  onChange={e =>
                                    handleChildConfigChange(
                                      parentId!,
                                      s.subject,
                                      "sessionsPerWeek",
                                      Number(e.target.value)
                                    )
                                  }
                                  className="w-24"
                                />
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {/* Children selection for parents */}
            {userRole === "parent" && (
              <div>
                <label className="block font-medium mb-2">Select Child(ren) & Subjects</label>
                {isLoadingChildren ? (
                  <div className="text-muted-foreground text-sm">Loading children...</div>
                ) : children.length === 0 ? (
                  <div className="flex flex-col items-center gap-4 py-8">
                    <span className="text-muted-foreground text-sm">
                      No children found. Please add a child to begin customizing their learning journey.
                    </span>
                    <Button asChild>
                      <a href="/dashboard/parent/children/add">
                        Add Child
                      </a>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {children.map(child => (
                      <div key={child.id} className="border rounded-lg p-4">
                        <div className="font-semibold mb-2">{child.name}</div>
                        <div className="mb-2 text-sm text-muted-foreground">
                          Select subjects for {child.name}:
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <div className="font-semibold mb-2">Languages</div>
                            <div className="space-y-2">
                              {LANGUAGE_SUBJECTS.map(subject => (
                                <label key={subject} className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={selectedSubjects.some(
                                      s => s.subject === subject && s.childId === child.id
                                    )}
                                    onChange={() => handleChildSubjectToggle(child.id, subject)}
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
                                    checked={selectedSubjects.some(
                                      s => s.subject === subject && s.childId === child.id
                                    )}
                                    onChange={() => handleChildSubjectToggle(child.id, subject)}
                                  />
                                  {subject}
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                        {/* Subject configs for this child */}
                        {selectedSubjects.filter(s => s.childId === child.id).length > 0 && (
                          <div className="space-y-4 mt-4">
                            {selectedSubjects
                              .filter(s => s.childId === child.id)
                              .map(s => (
                                <div key={s.subject} className="flex flex-wrap gap-4 items-center">
                                  <div className="font-medium">{s.subject}</div>
                                  <div>
                                    <label className="block text-sm">Students</label>
                                    <Input
                                      type="number"
                                      min={1}
                                      max={10}
                                      value={s.numberOfStudents}
                                      onChange={e =>
                                        handleChildConfigChange(
                                          child.id,
                                          s.subject,
                                          "numberOfStudents",
                                          Number(e.target.value)
                                        )
                                      }
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
                                      onChange={e =>
                                        handleChildConfigChange(
                                          child.id,
                                          s.subject,
                                          "hoursPerSession",
                                          Number(e.target.value)
                                        )
                                      }
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
                                      onChange={e =>
                                        handleChildConfigChange(
                                          child.id,
                                          s.subject,
                                          "sessionsPerWeek",
                                          Number(e.target.value)
                                        )
                                      }
                                      className="w-24"
                                    />
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {/* For students or non-parent users */}
            {userRole !== "parent" && (
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
                {/* Subject configs for student */}
                {selectedSubjects.length > 0 && (
                  <div className="space-y-6 mt-4">
                    {selectedSubjects.map(s => (
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
                              onChange={e =>
                                handleConfigChange(s.subject, "numberOfStudents", Number(e.target.value))
                              }
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
                              onChange={e =>
                                handleConfigChange(s.subject, "hoursPerSession", Number(e.target.value))
                              }
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
                              onChange={e =>
                                handleConfigChange(s.subject, "sessionsPerWeek", Number(e.target.value))
                              }
                              className="w-24"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {/* Plan selection */}
            <div>
              <label className="block font-medium mb-2">Select Plan</label>
              <div className="flex flex-wrap gap-4">
                {PLAN_OPTIONS.map(plan => (
                  <label
                    key={plan.value}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 rounded-lg border cursor-pointer transition-all",
                      selectedPlan === plan.value
                        ? "border-primary bg-primary/10 ring-2 ring-primary"
                        : "border-border hover:bg-muted"
                    )}
                    style={{ minWidth: 160 }}
                  >
                    <input
                      type="radio"
                      name="plan"
                      value={plan.value}
                      checked={selectedPlan === plan.value}
                      onChange={() => setSelectedPlan(plan.value)}
                      className="accent-primary"
                      style={{ accentColor: "var(--primary)" }}
                    />
                    <div className="flex flex-col">
                      <span className="font-semibold text-base">{plan.label}</span>
                      <span className="text-xs text-muted-foreground">{plan.display}</span>
                      {plan.discount > 0 && (
                        <span className="mt-1 inline-block text-xs font-semibold text-green-700 bg-green-100 rounded px-2 py-0.5">
                          -{Math.round(plan.discount * 100)}% off
                        </span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="bg-primary/5 p-6 rounded-lg space-y-4">
              <div className="flex justify-between items-baseline text-sm">
                <span>Base rate per hour</span>
                <span className="font-medium">${hourlyRate}</span>
              </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between items-baseline">
                  <span className="text-lg font-medium">
                    {planObj.label} Total
                  </span>
                  <span className="text-3xl font-bold">${totalCost}</span>
                </div>
                {planDiscount > 0 && (
                  <div className="flex justify-between items-baseline text-xs text-green-700 mt-2">
                    <span>Discount applied</span>
                    <span>- ${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Billed {selectedPlan}. Cancel anytime.
                </p>
              </div>
            </div>
            <Button
              size="lg"
              className="w-full"
              onClick={() => handlePayment()}
              disabled={isLoading}
            >
              {isLoading
                ? <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    Processing Payment...
                  </span>
                : session
                ? "Get Started Now"
                : "Sign in to Continue"}
            </Button>
          </div>
        </Card>
      )}
    </>
  )
}
