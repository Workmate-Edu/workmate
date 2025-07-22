// app/(dashboard)/parent/assessments/page.tsx
"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, FileText, CheckCircle } from "lucide-react"
import { toast } from "sonner"

interface Assessment {
  id: string
  title: string
  subject: string
  type: string
  status: "active" | "submitted" | "graded"
  dueDate: string
  questions?: Array<{ points: number }>
  totalPoints?: number
  grade?: number
}

export default function ParentAssessmentsPage() {
  const router = useRouter()
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [interested, setInterested] = useState<boolean | null>(null)

  useEffect(() => {
    // first fetch parent profile to check interestedInLearning
    fetch("/api/parent/profile", { cache: "no-cache" })
      .then((r) => r.json())
      .then((data) => {
        setInterested(!!data.parentProfile?.interestedInLearning)
        if (data.parentProfile?.interestedInLearning) {
          // now load assessments
          return fetch("/api/parent/assessments", { cache: "no-cache" })
        } else {
          throw null
        }
      })
      .then((res) => {
        if (res && res.ok) return res.json()
        throw new Error("Failed to fetch")
      })
      .then((list: Assessment[]) => setAssessments(list))
      .catch((err) => {
        if (err) toast.error("No learning assessments available")
      })
      .finally(() => setIsLoading(false))
  }, [])

  const totalPoints = (a: Assessment) =>
    a.questions?.reduce((sum, q) => sum + q.points, 0) || a.totalPoints || 0

  const renderCard = (a: Assessment) => (
    <Card key={a.id} className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold">{a.title}</h3>
            <p className="text-sm text-muted-foreground">{a.subject}</p>
          </div>
          <div className="flex items-center gap-2">
            {a.status === "graded" && (
              <div className="text-right mr-4">
                <p className="text-sm text-muted-foreground">Grade</p>
                <p className="font-bold text-green-600">
                  {a.grade}/{totalPoints(a)}
                </p>
              </div>
            )}
            <Button
              onClick={() =>
                router.push(`/dashboard/parent/assessments/${a.id}`)
              }
            >
              {a.status === "active" ? "Start" : "View"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Due: {new Date(a.dueDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{totalPoints(a)} pts</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>{a.type.replace("_", " ")}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (isLoading) {
    return (
      <div className="text-center py-12 text-muted-foreground">Loading…</div>
    )
  }

  if (interested === false) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground mb-4">
          You’re not currently enrolled in learning assessments.
        </p>
        <Button onClick={() => router.push("/dashboard/parent/profile")}>
          Update Preferences
        </Button>
      </div>
    )
  }

  // group by status
  const byStatus = (s: Assessment["status"]) =>
    assessments.filter((a) => a.status === s)

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">My Learning Assessments</h1>

      <div className="grid gap-4 md:grid-cols-3">
        {(
          [
            ["active", "Pending", Clock, "text-blue-600"],
            ["submitted", "Submitted", FileText, "text-orange-600"],
            ["graded", "Graded", CheckCircle, "text-green-600"],
          ] as const
        ).map(([key, label, Icon, color]) => (
          <Card key={key}>
            <CardContent className="p-4 flex items-center gap-4">
              <Icon className={`h-6 w-6 ${color}`} />
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-2xl font-bold">
                  {byStatus(key).length}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="submitted">Submitted</TabsTrigger>
          <TabsTrigger value="graded">Graded</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {byStatus("active").length
            ? byStatus("active").map(renderCard)
            : (
              <p className="text-center text-muted-foreground">
                No pending assessments
              </p>
            )}
        </TabsContent>

        <TabsContent value="submitted" className="mt-6">
          {byStatus("submitted").length
            ? byStatus("submitted").map(renderCard)
            : (
              <p className="text-center text-muted-foreground">
                No submitted assessments
              </p>
            )}
        </TabsContent>

        <TabsContent value="graded" className="mt-6">
          {byStatus("graded").length
            ? byStatus("graded").map(renderCard)
            : (
              <p className="text-center text-muted-foreground">
                No graded assessments
              </p>
            )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
