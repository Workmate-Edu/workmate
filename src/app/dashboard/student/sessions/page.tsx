"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Video, BookOpen, Users, Star } from "lucide-react"
import { format, isPast } from "date-fns"
import { toast } from "sonner"
import { PageHeader } from "@/components/layouts/page-header"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface TeacherInfo {
  _id: string
  name: string
  email: string
  profileImage?: string
}

interface Session {
  _id: string
  subject: {
    name: string
    area: string
  }
  startTime: string
  endTime: string
  duration: number
  meetingLink: string
  status: 'scheduled' | 'active' | 'completed' | 'cancelled' | 'teacher-completed'
  teacher: TeacherInfo
  recurrence?: {
    isRecurring: boolean
    pattern: string
    daysOfWeek: number[]
    startDate: string
    endDate: string
    time: string
  }
  timezone?: string // <-- add timezone field
}

const getStatusColor = (status: string, startTime: string) => {
  const isPastSession = isPast(new Date(startTime))
  if (isPastSession && status === "scheduled") {
    return "bg-red-500"
  }
  switch (status.toLowerCase()) {
    case "scheduled":
      return "bg-blue-500"
    case "active":
      return "bg-green-500"
    case "completed":
      return "bg-gray-500"
    case "cancelled":
      return "bg-red-500"
    default:
      return "bg-gray-500"
  }
}

const getSessionStatus = (session: Session) => {
  if (!session.recurrence?.isRecurring) {
    const isPastSession = isPast(new Date(session.startTime))
    if (isPastSession && session.status === "scheduled") {
      return "Past Due"
    }
  } else {
    const endDate = new Date(session.recurrence.endDate)
    if (isPast(endDate) && session.status === "scheduled") {
      return "Series Ended"
    }
  }
  return session.status.charAt(0).toUpperCase() + session.status.slice(1)
}

const isSessionActive = (session: Session) => {
  if (session.recurrence?.isRecurring) {
    const endDate = new Date(session.recurrence.endDate)
    return !isPast(endDate)
  }
  return !isPast(new Date(session.startTime))
}

export default function StudentSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewModal, setReviewModal] = useState<{ open: boolean, session?: Session }>(
    { open: false, session: undefined }
  )
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState("")
  const [reviewLoading, setReviewLoading] = useState(false)
  const [reviewedSessionIds, setReviewedSessionIds] = useState<string[]>([])

  // Helper to fetch teacher rating (average)
  const [teacherRatings, setTeacherRatings] = useState<Record<string, number>>({})

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/student/sessions")
      if (!response.ok) throw new Error("Failed to fetch sessions")
      const data = await response.json()
      setSessions(data)
    } catch {
      toast.error("Failed to load sessions")
    } finally {
      setLoading(false)
    }
  }

  // Fetch reviewed sessions for this student (to avoid duplicate reviews)
  useEffect(() => {
    async function fetchReviewed() {
      const res = await fetch("/api/teacher/reviews?teacherId=all&mine=1")
      if (res.ok) {
        const data = await res.json()
        setReviewedSessionIds(data.map((r: any) => r.sessionId))
      }
    }
    fetchReviewed()
  }, [])

  // Show review modal after session is completed and not reviewed
  useEffect(() => {
    if (!sessions?.length) return
    const completedUnreviewed = sessions.find(
      s =>
        s.status === "teacher-completed" &&
        !reviewedSessionIds.includes(s._id)
    )
    if (completedUnreviewed) {
      setReviewModal({ open: true, session: completedUnreviewed })
    }
  }, [sessions, reviewedSessionIds])

  const handleSubmitReview = async () => {
    if (!reviewModal.session || reviewRating < 1) return
    setReviewLoading(true)
    try {
      await fetch("/api/teacher/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: reviewModal.session.teacher._id,
          sessionId: reviewModal.session._id,
          rating: reviewRating,
          comment: reviewComment
        })
      })
      toast.success("Review submitted!")
      setReviewedSessionIds(prev => [...prev, reviewModal.session!._id])
      setReviewModal({ open: false, session: undefined })
      setReviewRating(0)
      setReviewComment("")
      fetchSessions()
    } catch {
      toast.error("Failed to submit review")
    }
    setReviewLoading(false)
  }

  const formatRecurrenceInfo = (session: Session) => {
    if (!session.recurrence?.isRecurring) return null
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ]
    const selectedDays = session.recurrence.daysOfWeek
      .map((d) => days[d])
      .join(", ")
    const endDate = format(new Date(session.recurrence.endDate), "PPP")
    return `🔄 ${session.recurrence.pattern} on ${selectedDays} until ${endDate}`
  }

  // Fetch teacher average ratings from user model
  useEffect(() => {
    async function fetchRatings() {
      const teacherIds = Array.from(new Set(sessions.map(s => s.teacher._id)))
      if (teacherIds.length === 0) return
      const ratings: Record<string, number> = {}
      await Promise.all(
        teacherIds.map(async id => {
          const res = await fetch(`/api/teacher/profile?id=${id}`)
          if (res.ok) {
            const data = await res.json()
            ratings[id] = data?.teacherProfile?.ratings?.average || 0
          }
        })
      )
      setTeacherRatings(ratings)
    }
    fetchRatings()
  }, [sessions])

  const renderSession = (session: Session) => {
    const isActiveSession = isSessionActive(session)
    const statusColor = session.recurrence?.isRecurring
      ? session.status === "cancelled"
        ? "bg-red-500"
        : "bg-blue-500"
      : getStatusColor(session.status, session.startTime)

    // Show review button for teacher completed or past due sessions not yet reviewed
    const canReview =
      (session.status === "completed" || getSessionStatus(session) === "Past Due") &&
      !reviewedSessionIds.includes(session._id)
    const isReviewed = reviewedSessionIds.includes(session._id)
    const teacherRating = teacherRatings[session.teacher._id]

    return (
      <Card key={session._id} className="mb-4">
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 gap-4">
          <div className="space-y-2 w-full sm:w-auto">
            {/* Header */}
            <div className="flex flex-wrap items-start gap-2">
              <div className="flex items-center space-x-2 flex-1">
                <BookOpen className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium truncate">
                  {session.subject.name}{" "}
                  <span className="text-sm text-muted-foreground ml-1">
                    ({session.subject.area})
                  </span>
                </span>
              </div>
              <Badge className={`${statusColor} whitespace-nowrap`}>
                {getSessionStatus(session)}
              </Badge>
            </div>

            {/* Date & Time */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="mr-1 h-4 w-4 flex-shrink-0" />
                <span>{format(new Date(session.startTime), "PPP")}</span>
              </div>
              <div className="flex items-center">
                <Clock className="mr-1 h-4 w-4 flex-shrink-0" />
                <span>
                  {format(new Date(session.startTime), "p")}
                  {session.timezone && (
                    <span className="ml-2 text-muted-foreground">({session.timezone})</span>
                  )}
                </span>
              </div>
            </div>

            {/* Teacher */}
            <div className="flex items-center space-x-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="font-medium">
                {session.teacher.name || "Not assigned"}
              </span>
              {typeof teacherRating === "number" && teacherRating > 0 && (
                <span className="ml-2 text-yellow-500 flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  {teacherRating.toFixed(1)}
                </span>
              )}
            </div>

            {/* Recurrence */}
            {session.recurrence?.isRecurring && (
              <p className="text-xs text-blue-600 break-words">
                {formatRecurrenceInfo(session)}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2 w-full sm:w-auto">
            {/* Join Button */}
            {session.meetingLink && (
              <Button
                className="w-full sm:w-auto whitespace-nowrap"
                variant={isActiveSession ? "default" : "secondary"}
                disabled={!isActiveSession}
                onClick={() =>
                  isActiveSession && window.open(session.meetingLink, "_blank")
                }
              >
                <Video className="w-4 h-4 mr-2" />
                {isActiveSession
                  ? "Join Session"
                  : session.recurrence?.isRecurring
                  ? "Series Ended"
                  : "Session Ended"}
              </Button>
            )}
            {/* Review Button */}
            {canReview && (
              <Button
                variant="outline"
                className="mt-2 w-full sm:w-auto"
                onClick={() => setReviewModal({ open: true, session })}
              >
                <Star className="w-4 h-4 mr-2 text-yellow-400" />
                Review Teacher
              </Button>
            )}
            {isReviewed && (
              <span className="inline-block mt-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold w-full sm:w-auto text-center">
                Reviewed
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">My Sessions</h1>
          <p className="text-muted-foreground">
            View all your scheduled classes
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <Card className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          </Card>
        ) : sessions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-48 space-y-4">
              <Calendar className="h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground">No sessions scheduled</p>
            </CardContent>
          </Card>
        ) : (
          sessions.map(renderSession)
        )}
      </div>

      {/* Review Modal */}
      <Dialog open={reviewModal.open} onOpenChange={open => setReviewModal({ open, session: reviewModal.session })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              How was your lesson with {reviewModal.session?.teacher?.name}?
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex gap-2 items-center justify-center">
              {[1,2,3,4,5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  className="bg-transparent border-none"
                  aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                >
                  <Star className={`w-8 h-8 ${reviewRating >= star ? "text-yellow-400" : "text-gray-300"}`} />
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
              <Button
                variant="outline"
                onClick={() => setReviewModal({ open: false, session: undefined })}
                disabled={reviewLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitReview}
                disabled={reviewRating < 1 || reviewLoading}
              >
                {reviewLoading ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
