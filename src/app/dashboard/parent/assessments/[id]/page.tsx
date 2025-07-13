"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Clock, AlertTriangle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { FileViewer } from "@/components/file-viewer"

export default function ParentAssessmentDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()

  const [assessment, setAssessment] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // 1) Redirect non-parents or not-yet-opted-in
  useEffect(() => {
    if (status !== "loading") {
      if (!session?.user || session.user.role !== "parent") {
        router.replace("/auth/signin")
        return
      }
      fetch("/api/parent/profile", { headers: { "Cache-Control": "no-cache" } })
        .then(r => r.json())
        .then(data => {
          if (!data.parentProfile?.interestedInLearning) {
            toast({
              title: "Not enrolled",
              description: "Enable learning in your profile to view assessments",
              variant: "destructive",
            })
            router.replace("/dashboard/parent")
          }
        })
        .catch(() => router.replace("/dashboard/parent"))
    }
  }, [status])

  // 2) Load the assessment
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/parent/assessments/${id}`)
        if (!res.ok) throw new Error()
        const json = await res.json()
        setAssessment(json)
      } catch {
        toast({
          title: "Error",
          description: "Failed to load assessment",
          variant: "destructive",
        })
        router.replace("/dashboard/parent")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const isOverdue = assessment && new Date(assessment.dueDate) < new Date()

  // only allow update if before due date and not yet graded/submitted
  const canUpdate = () => {
    if (!assessment) return false
    if (assessment.status === "submitted" || assessment.status === "graded") return false
    return new Date() < new Date(assessment.dueDate)
  }

  const handleEdit = () => {
    router.push(`/dashboard/parent/assessment/edit/${id}`)
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (!assessment) {
    return <div className="text-center py-20">Assessment not found</div>
  }

  return (
    <div className="container max-w-3xl mx-auto p-6">
      <Card className="p-8 space-y-6">
        <header className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{assessment.title}</h1>
            <p className="text-muted-foreground mt-1">{assessment.description}</p>
          </div>
          <div className="flex gap-2">
            <Badge>{assessment.type}</Badge>
            <Badge variant={assessment.status === "graded" ? "default" : "secondary"}>
              {assessment.status.charAt(0).toUpperCase() + assessment.status.slice(1)}
            </Badge>
          </div>
        </header>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Due: {format(new Date(assessment.dueDate), "PPp")}</span>
          {isOverdue && (
            <div className="flex items-center gap-1 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span>Overdue</span>
            </div>
          )}
        </div>

        <section className="space-y-6">
          {assessment.questions.map((q: any) => (
            <Card key={q.id} className="p-6 space-y-4">
              <div className="flex justify-between">
                <p className="font-medium">{q.question}</p>
                <Badge>{q.type}</Badge>
              </div>

              {/* file attachments */}
              {q.type === "file" && q.attachment && (
                <FileViewer file={q.attachment} />
              )}

              {/* display submitted answer */}
              {assessment.submission?.answers?.some((a: any) => a.questionId === q.id) && (
                <div>
                  <p className="text-sm font-medium">Your Answer:</p>
                  <p className="text-muted-foreground">
                    {
                      assessment.submission.answers.find((a: any) => a.questionId === q.id)
                        .answer
                    }
                  </p>
                </div>
              )}
            </Card>
          ))}
        </section>

        <footer className="flex justify-between items-center">
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
          {canUpdate() && (
            <Button onClick={handleEdit}>Update Submission</Button>
          )}
        </footer>

        {isOverdue && !assessment.submission && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <p>This assessment is overdue and cannot be submitted.</p>
          </div>
        )}
      </Card>
    </div>
  )
}
