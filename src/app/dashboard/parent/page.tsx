"use client"

import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import {
  BookOpen,
  GraduationCap,
  Users,
  MessageSquare,
  Plus,
  ClipboardCheck,
  Edit,
  Calendar,
  Video,
  AlertTriangle,
  Star as StarIcon,
} from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { isPast } from "date-fns"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Child {
  id: string
  name: string
  email: string
  grade?: string
  subjects?: { name: string; teacher?: { name: string }; progress?: number }[]
  assessmentStatus: {
    exists: boolean
    status: "none" | "pending" | "assigned"
    canCreate: boolean
    canEdit: boolean
  }
}

interface Session {
  id: string
  teacher: { id: string; name: string }
  student: { id: string; name: string }
  subject: { name: string; area: string }
  startTime: string
  endTime: string
  status: string
  meetingLink?: string
}

export default function ParentDashboardPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const [children, setChildren] = useState<Child[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<any>(null)

  // map childId → has availability?
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, boolean>>({})

  // review state
  const [reviewedSessionIds, setReviewedSessionIds] = useState<string[]>([])
  const [reviewModal, setReviewModal] = useState<{ open: boolean; session?: Session }>({
    open: false,
    session: undefined,
  })
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState("")
  const [reviewLoading, setReviewLoading] = useState(false)

  // teacher stats
  const [teacherStats, setTeacherStats] = useState<Record<string, { average: number; count: number }>>({})

  // 1) load children
  useEffect(() => {
    async function fetchChildren() {
      try {
        const res = await fetch("/api/parent/children")
        if (!res.ok) throw new Error()
        const data = await res.json()
        setChildren(data.children || [])
      } finally {
        setLoading(false)
      }
    }
    fetchChildren()
  }, [])

  // 2) load subscription
  useEffect(() => {
    fetch("/api/subscription/status")
      .then(r => r.json())
      .then(d => setSubscription(d.subscription))
      .catch(() => setSubscription(null))
  }, [])

  // 3) load upcoming sessions
  useEffect(() => {
    async function fetchSessions() {
      try {
        const res = await fetch("/api/parent/children-sessions")
        if (!res.ok) throw new Error()
        setSessions(await res.json())
      } catch {
        toast.error("Failed to load schedule")
      }
    }
    fetchSessions()
  }, [])

  // 4) load reviewed sessions
  useEffect(() => {
    async function fetchReviewed() {
      const res = await fetch("/api/teacher/reviews?teacherId=all&mine=1")
      if (!res.ok) return
      const data = await res.json()
      setReviewedSessionIds(data.map((r: any) => r.sessionId))
    }
    fetchReviewed()
  }, [])

  // 5) load each teacher’s stats
  useEffect(() => {
    const ids = Array.from(new Set(sessions.map(s => s.teacher.id)))
    if (!ids.length) return
    async function fetchStats() {
      const out: typeof teacherStats = {}
      await Promise.all(ids.map(async tid => {
        const res = await fetch(`/api/teacher/profile?id=${tid}`)
        if (!res.ok) return
        const d = await res.json()
        out[tid] = {
          average: d.teacherProfile?.ratings?.average ?? 0,
          count: d.teacherProfile?.ratings?.count ?? 0,
        }
      }))
      setTeacherStats(out)
    }
    fetchStats()
  }, [sessions])

  // 6) fetch availability for each child
  useEffect(() => {
    if (!children.length) return
    children.forEach(child => {
      fetch(`/api/parent/children/${child.id}/availability`)
        .then(r => {
          if (!r.ok) throw new Error()
          return r.json()
        })
        .then(d => {
          setAvailabilityMap(prev => ({
            ...prev,
            [child.id]: Array.isArray(d.days) && d.days.length > 0
          }))
        })
        .catch(() => {
          setAvailabilityMap(prev => ({ ...prev, [child.id]: false }))
        })
    })
  }, [children])

  const getChildAllowedSubjects = (childId: string) => {
    return subscription?.subjects
      .filter((s: any) => s.childId === childId)
      .map((s: any) => s.subject) || []
  }

  const getParentAllowedSubjects = () => {
    return subscription?.subjects
      .filter((s: any) => s.childId === session?.user?.id)
      .map((s: any) => s.subject) || []
  }

  const renderAssessmentButton = (child: Child) => {
    const { exists, status, canCreate, canEdit } = child.assessmentStatus
    if (!exists && canCreate) {
      return (
        <Button variant="default" className="w-full mt-3" asChild>
          <Link href={`/dashboard/parent/children/${child.id}/assessment`}>
            <ClipboardCheck className="mr-2 h-4 w-4" />
            Create Initial Assessment
          </Link>
        </Button>
      )
    }
    if (status === "pending" && canEdit) {
      return (
        <Button variant="secondary" className="w-full mt-3" asChild>
          <Link href={`/dashboard/parent/children/${child.id}/assessment/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Initial Assessment
          </Link>
        </Button>
      )
    }
    return null
  }

  const handleSubmitReview = async () => {
    if (!reviewModal.session || reviewRating < 1) return
    setReviewLoading(true)
    try {
      await fetch("/api/teacher/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: reviewModal.session.teacher.id,
          sessionId: reviewModal.session.id,
          rating: reviewRating,
          comment: reviewComment,
        }),
      })
      toast.success("Review submitted!")
      setReviewedSessionIds(ids => [...ids, reviewModal.session!.id])

      // refresh teacher stats
      const tid = reviewModal.session.teacher.id
      const statRes = await fetch(`/api/teacher/profile?id=${tid}`)
      if (statRes.ok) {
        const upd = await statRes.json()
        setTeacherStats(old => ({
          ...old,
          [tid]: {
            average: upd.teacherProfile?.ratings?.average ?? 0,
            count: upd.teacherProfile?.ratings?.count ?? 0,
          }
        }))
      }
      setReviewModal({ open: false, session: undefined })
      setReviewRating(0)
      setReviewComment("")
    } catch {
      toast.error("Failed to submit review")
    } finally {
      setReviewLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-6">
        <div className="flex justify-center">
          <Users className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {session?.user?.name}
        </h1>
        <Button asChild>
          <Link href="/dashboard/parent/children/add">
            <Plus className="mr-2 h-4 w-4" />
            Add Child
          </Link>
        </Button>
      </div>

      {/* Initial Assessment Alert */}
      {children.some(c => !c.assessmentStatus.exists && c.assessmentStatus.canCreate) && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Initial Assessment Required</AlertTitle>
          <AlertDescription>
            <div className="space-y-2">
              {children
                .filter(c => !c.assessmentStatus.exists && c.assessmentStatus.canCreate)
                .map(child => (
                  <div key={child.id} className="flex items-center justify-between">
                    <span>
                      {child.name} needs an initial assessment.
                    </span>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/parent/children/${child.id}/assessment`}>
                        Start Assessment
                      </Link>
                    </Button>
                  </div>
                ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Teacher Pairing Pending + Availability */}
      {children.some(c => c.assessmentStatus.exists && c.assessmentStatus.status === "pending") && (
        <Alert variant="info">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Teacher Pairing Pending</AlertTitle>
          <AlertDescription>
            <div className="space-y-2">
              {children
                .filter(c => c.assessmentStatus.exists && c.assessmentStatus.status === "pending")
                .map(child => {
                  const hasAvail = availabilityMap[child.id]
                  return (
                    <div key={child.id} className="flex items-center justify-between">
                      <span>
                        {child.name}'s assessment is pending pairing.
                      </span>
                      <Button variant={hasAvail ? "outline" : "default"} size="sm" asChild>
                        <Link href={`/dashboard/parent/children/${child.id}/availability`}>
                          {hasAvail 
                            ? <> <Edit className="mr-1 h-4 w-4"/> Edit Availability </>
                            : <> <Plus className="mr-1 h-4 w-4"/> Create Availability </>
                          }
                        </Link>
                      </Button>
                    </div>
                  )
                })}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Upcoming Sessions */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Upcoming Sessions</h2>
          <Button variant="outline" asChild>
            <Link href="/dashboard/parent/children-sessions">View More</Link>
          </Button>
        </div>
        {sessions.length === 0 ? (
          <p className="text-muted-foreground">No upcoming sessions.</p>
        ) : (
          sessions.slice(0, 3).map(sess => {
            const ended = isPast(new Date(sess.endTime))
            const canReview = ended && !reviewedSessionIds.includes(sess.id)
            const stats = teacherStats[sess.teacher.id] || { average: 0, count: 0 }
            return (
              <Card key={sess.id} className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium capitalize">
                      {sess.subject.name} – {sess.subject.area}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Student: {sess.student.name}
                    </p>
                  </div>
                  <Badge variant={ended ? "secondary" : sess.status === "scheduled" ? "default" : "secondary"}>
                    {ended ? "Ended" : sess.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {new Date(sess.startTime).toLocaleDateString()}{" "}
                    {new Date(sess.startTime).toLocaleTimeString()} –{" "}
                    {new Date(sess.endTime).toLocaleTimeString()}
                  </span>
                </div>
                {sess.meetingLink && (
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={ended}
                    onClick={() => window.open(sess.meetingLink, "_blank")}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    {ended ? "Session Ended" : "Join Meeting"}
                  </Button>
                )}
                {canReview && (
                  <Button
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => setReviewModal({ open: true, session: sess })}
                  >
                    <StarIcon className="h-4 w-4 mr-2 text-yellow-400" />
                    Review Teacher
                  </Button>
                )}
              </Card>
            )
          })
        )}
      </div>

      {/* Review Modal */}
      <Dialog
        open={reviewModal.open}
        onOpenChange={open => setReviewModal({ open, session: reviewModal.session })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              How was your lesson with {reviewModal.session?.teacher.name}?
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex justify-center gap-2">
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setReviewRating(n)} className="p-1">
                  <StarIcon
                    className={`w-8 h-8 ${
                      reviewRating >= n ? "text-yellow-400" : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            <textarea
              className="border rounded p-2 w-full"
              placeholder="Leave a comment (optional)"
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              rows={3}
              disabled={reviewLoading}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" disabled={reviewLoading} onClick={() => setReviewModal({ open: false })}>
                Cancel
              </Button>
              <Button disabled={reviewRating < 1 || reviewLoading} onClick={handleSubmitReview}>
                {reviewLoading ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Parent Self‑Learning */}
      {getParentAllowedSubjects().length > 0 && (
        <Card className="relative overflow-hidden group hover:shadow-lg border-2 border-primary/40">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/50" />
          <div className="p-6 flex flex-col justify-between h-full">
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">
                    {session?.user?.name} (You)
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">{session?.user?.email}</p>
                </div>
                <Badge variant="default">Parent</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium flex items-center gap-1">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  Subscribed Subjects
                </p>
                <div className="flex flex-wrap gap-2">
                  {getParentAllowedSubjects().map((subj, i) => (
                    <Badge key={i} variant="secondary">{subj}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Children Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {children.map(child => {
          const allowed = getChildAllowedSubjects(child.id)
          const hasAvail = availabilityMap[child.id]
          return (
            <Card key={child.id} className="relative overflow-hidden group hover:shadow-lg">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/50" />
              <div className="p-6 flex flex-col justify-between h-full">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-semibold tracking-tight">{child.name}</h2>
                      <p className="text-sm text-muted-foreground mt-1">{child.email}</p>
                    </div>
                    <Badge variant={child.grade ? "default" : "secondary"}>
                      {child.grade || "No Grade"}
                    </Badge>
                  </div>

                  {/* Subscribed Subjects */}
                  <div className="space-y-1">
                    <p className="text-sm font-medium flex items-center gap-1">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      Subscribed Subjects
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {allowed.length > 0 ? (
                        allowed.map((s,i) => <Badge key={i} variant="secondary">{s}</Badge>)
                      ) : (
                        <span className="text-xs text-muted-foreground">No subscription</span>
                      )}
                    </div>
                  </div>

                  {/* Subject Count & Progress */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium flex items-center gap-1">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        Subjects
                      </p>
                      <p className="text-2xl font-bold">{child.subjects?.length || 0}</p>
                    </div>
                  </div>
                  {child.subjects?.length > 0 && (
                    <div className="space-y-3">
                      {child.subjects.map((subj, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <p className="font-medium capitalize">{subj.name}</p>
                            {subj.teacher && <p className="text-muted-foreground">{subj.teacher.name}</p>}
                          </div>
                          <Progress value={subj.progress || 0} className="h-1.5" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 mt-2">
                  <Link href={`/dashboard/parent/children/${child.id}`}>
                    <Button variant="outline" className="w-full">
                      <GraduationCap className="mr-2 h-4 w-4" /> View Details
                    </Button>
                  </Link>
                  <Link href={`/dashboard/parent/messages`}>
                    <Button variant="outline" className="w-full">
                      <MessageSquare className="mr-2 h-4 w-4" /> Message Teachers
                    </Button>
                  </Link>
                  <Link href={`/dashboard/parent/children/${child.id}/availability`}>
                    <Button
                      variant={hasAvail ? "outline" : "default"}
                      className="w-full"
                    >
                      {hasAvail
                        ? <><Edit className="mr-2 h-4 w-4"/> Edit Availability</>
                        : <><Plus className="mr-2 h-4 w-4"/> Create Availability</>
                      }
                    </Button>
                  </Link>
                </div>

                {/* Assessment */}
                {renderAssessmentButton(child)}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
