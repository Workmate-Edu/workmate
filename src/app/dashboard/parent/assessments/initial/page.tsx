"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { BookOpen, Target, Clock } from "lucide-react"

const subjects = {
  languages: ["Yoruba", "Hausa", "Igbo", "Arabic", "Swahili"],
  stem: ["Math", "Physics", "Chemistry", "Biology", "Computer Science"],
}

export default function ParentInitialAssessment() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [init, setInit] = useState(false)
  const [category, setCategory] = useState<"languages" | "stem" | "">("")
  const [subject, setSubject] = useState("")
  const [qIndex, setQIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const questions = [
    "What's your current level of experience?",
    "How much time can you dedicate to learning?",
    "What are your main goals?",
  ]

  // 1) Guard: only parents who've opted into learning
  useEffect(() => {
    if (status !== "loading") {
      if (!session?.user || session.user.role !== "parent") {
        router.replace("/auth/signin")
        return
      }
      fetch("/api/parent/profile", { headers: { "Cache-Control": "no-cache" } })
        .then((r) => r.json())
        .then((data) => {
          if (!data.parentProfile?.interestedInLearning) {
            toast.error("You’re not enrolled as a learner")
            router.replace("/dashboard/parent")
          } else {
            setInit(true)
          }
        })
        .catch(() => router.replace("/dashboard/parent"))
    }
  }, [status])

  // 2) Prevent duplicates: run *always*, but bail out until init && subject
  useEffect(() => {
    if (!init || !subject) return
    fetch("/api/parent/assessments", { headers: { "Cache-Control": "no-cache" } })
      .then((r) => r.json())
      .then((list) => {
        if (
          list.some(
            (a: any) => a.subject.name.toLowerCase() === subject.toLowerCase()
          )
        ) {
          toast.error(`You've already done ${subject}`)
          router.push("/dashboard/parent")
        }
      })
      .catch(console.error)
  }, [init, subject])

  // Don't render until guard passes
  if (!init) return null

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const payload = {
        subject: { name: subject, area: category },
        responses: [
          {
            category: "Initial Assessment",
            questions: Object.entries(answers).map(([i, ans]) => ({
              questionId: i,
              question: questions[+i],
              answer: ans,
            })),
          },
        ],
      }
      const res = await fetch("/api/parent/assessments/initial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw await res.json()
      toast.success("Assessment submitted!")
      router.push("/dashboard/parent")
    } catch (e: any) {
      toast.error(e.message || "Submission failed")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="p-6">
        {/* Step 1: choose category */}
        {!category && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[
              {
                value: "languages",
                label: "Languages",
                icon: "🗣️",
                description: "Learn African languages & cultures",
              },
              {
                value: "stem",
                label: "STEM",
                icon: "🔬",
                description: "Science, Tech, Engineering & Math",
              },
            ].map((cat) => (
              <Card
                key={cat.value}
                className={`p-6 cursor-pointer transition-all hover:border-primary ${
                  category === cat.value ? "border-primary bg-primary/5" : ""
                }`}
                onClick={() =>
                  setCategory(cat.value as "languages" | "stem")
                }
              >
                <div className="text-center space-y-2">
                  <span className="text-4xl">{cat.icon}</span>
                  <h3 className="font-medium">{cat.label}</h3>
                  <p className="text-sm text-muted-foreground">
                    {cat.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Step 2: choose subject */}
        {category && !subject && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            {subjects[category].map((sub) => (
              <Card
                key={sub}
                className={`p-6 cursor-pointer transition-all hover:border-primary ${
                  subject === sub ? "border-primary bg-primary/5" : ""
                }`}
                onClick={() => setSubject(sub)}
              >
                <h3 className="font-medium text-center">{sub}</h3>
              </Card>
            ))}
          </div>
        )}

        {/* Step 3: questions */}
        {category && subject && (
          <div className="space-y-6">
            <Progress
              value={((qIndex + 1) / questions.length) * 100}
              className="h-2 mb-4"
            />
            <div>
              <h2 className="font-medium mb-4">{questions[qIndex]}</h2>
              <Select
                onValueChange={(val) => {
                  setAnswers((p) => ({ ...p, [qIndex]: val }))
                  setQIndex((i) => i + 1)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your answer" />
                </SelectTrigger>
                <SelectContent>
                  {qIndex === 0 &&
                    ["beginner", "intermediate", "advanced"].map((v) => (
                      <SelectItem key={v} value={v}>
                        {v.charAt(0).toUpperCase() + v.slice(1)}
                      </SelectItem>
                    ))}
                  {qIndex === 1 &&
                    ["minimal", "moderate", "dedicated"].map((v) => (
                      <SelectItem key={v} value={v}>
                        {v === "minimal"
                          ? "5–10 minutes daily"
                          : v === "moderate"
                          ? "30 minutes daily"
                          : "1 hour+ daily"}
                      </SelectItem>
                    ))}
                  {qIndex === 2 &&
                    ["basics", "fluent", "professional"].map((v) => (
                      <SelectItem key={v} value={v}>
                        {v === "basics"
                          ? "Learn the Basics"
                          : v === "fluent"
                          ? "Become Fluent"
                          : "Professional Development"}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            {qIndex >= questions.length && (
              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? "Submitting…" : "Submit Assessment"}
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
