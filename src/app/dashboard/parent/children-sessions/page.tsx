"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Calendar, Users, Video, Star as StarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { isPast } from "date-fns"

interface Session {
  id: string
  student: { id: string; name: string }
  teacher: { id: string; id: string; name: string; email: string }
  subject: { name: string; area: string }
  startTime: string
  endTime: string
  meetingLink?: string
  status: string
  timezone?: string // <-- add timezone field
}

export default function ParentSchedulePage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  // teacher stats (average + count)
  const [teacherStats, setTeacherStats] = useState<
    Record<string, { average: number; count: number }>
  >({})

  // review state
  const [reviewedSessionIds, setReviewedSessionIds] = useState<string[]>([])
  const [reviewModal, setReviewModal] = useState<{
    open: boolean
    session?: Session
  }>({ open: false, session: undefined })
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState("")
  const [reviewLoading, setReviewLoading] = useState(false)

  // fetch sessions
  useEffect(() => {
    async function fetchSessions() {
      try {
        const res = await fetch("/api/parent/children-sessions")
        if (!res.ok) throw new Error()
        const data: Session[] = await res.json()
        setSessions(data)
      } catch {
        toast.error("Failed to load schedule")
      } finally {
        setLoading(false)
      }
    }
    fetchSessions()
  }, [])

  // fetch which sessions have already been reviewed by this parent
  useEffect(() => {
    async function fetchReviewed() {
      const res = await fetch("/api/teacher/reviews?teacherId=all&mine=1")
      if (!res.ok) return
      const reviews = await res.json()
      setReviewedSessionIds(reviews.map((r: any) => r.sessionId))
    }
    fetchReviewed()
  }, [])

  // fetch teacher stats once sessions are loaded
  useEffect(() => {
    const ids = Array.from(new Set(sessions.map(s => s.teacher.id)))
    if (ids.length === 0) return

    async function fetchStats() {
      const stats: Record<string, { average: number; count: number }> = {}
      await Promise.all(
        ids.map(async tid => {
          const res = await fetch(`/api/teacher/profile?id=${tid}`)
          if (!res.ok) return
          const data = await res.json()
          stats[tid] = {
            average: data.teacherProfile?.ratings?.average ?? 0,
            count:   data.teacherProfile?.ratings?.count   ?? 0,
          }
        })
      )
      setTeacherStats(stats)
    }
    fetchStats()
  }, [sessions])

  const handleSubmitReview = async () => {
    if (!reviewModal.session || reviewRating < 1) return
    setReviewLoading(true)
    try {
      await fetch("/api/teacher/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId:  reviewModal.session.teacher.id,
          sessionId:  reviewModal.session.id,
          rating:     reviewRating,
          comment:    reviewComment,
        }),
      })
      toast.success("Review submitted!")

      // mark this session as reviewed
      setReviewedSessionIds(ids => [...ids, reviewModal.session!.id])
      // close modal & reset
      setReviewModal({ open: false, session: undefined })
      setReviewRating(0)
      setReviewComment("")

      // re-fetch updated stats for this teacher
      const tid = reviewModal.session.teacher.id
      const res2 = await fetch(`/api/teacher/profile?id=${tid}`)
      if (res2.ok) {
        const upd = await res2.json()
        setTeacherStats(old => ({
          ...old,
          [tid]: {
            average: upd.teacherProfile?.ratings?.average ?? 0,
            count:   upd.teacherProfile?.ratings?.count   ?? 0,
          }
        }))
      }
    } catch {
      toast.error("Failed to submit review")
    } finally {
      setReviewLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Children's Schedule</h1>
        <p className="text-muted-foreground">View all scheduled sessions</p>
      </div>

      {sessions.length === 0 ? (
        <Card className="p-6">
          <div className="text-center text-muted-foreground">
            No sessions scheduled yet.
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sessions.map(session => {
            const ended      = isPast(new Date(session.endTime))
            const canReview  = ended && !reviewedSessionIds.includes(session.id)
            const isReviewed = reviewedSessionIds.includes(session.id)
            const stats      = teacherStats[session.teacher.id] ?? { average: 0, count: 0 }

            return (
              <Card key={session.id} className="p-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium capitalize">
                        {session.subject.name} – {session.subject.area}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Student: <span className="capitalize">{session.student.name}</span>
                      </p>
                    </div>
                    <Badge
                      variant={
                        ended
                          ? "secondary"
                          : session.status === "scheduled"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {ended ? "Ended" : session.status}
                    </Badge>
                  </div>

                  {/* Date & Time */}
                  <div className="flex items-center gap-4 text-sm">
                    <p className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {new Date(session.startTime).toLocaleDateString()}
                    </p>
                    <p className="text-muted-foreground">
                      {new Date(session.startTime).toLocaleTimeString()} –{" "}
                      {new Date(session.endTime).toLocaleTimeString()}
                      {session.timezone && (
                        <span className="ml-2 text-muted-foreground">({session.timezone})</span>
                      )}
                    </p>
                  </div>

                  {/* Teacher + avg rating */}
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div className="flex items-center gap-1">
                      <p>Teacher: {session.teacher.name}</p>
                      {stats.average > 0 && (
                        <span className="flex items-center gap-1 ml-2 text-sm text-yellow-500">
                          <StarIcon className="h-4 w-4" />
                          {stats.average.toFixed(1)} ({stats.count})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Join button */}
                  {session.meetingLink && (
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled={ended}
                      onClick={() => !ended && window.open(session.meetingLink, "_blank")}
                    >
                      <Video className="h-4 w-4 mr-2" />
                      {ended ? "Session Ended" : "Join Meeting"}
                    </Button>
                  )}

                  {/* Review / Reviewed */}
                  {canReview && (
                    <Button
                      variant="outline"
                      className="w-full mt-2"
                      onClick={() => setReviewModal({ open: true, session })}
                    >
                      <StarIcon className="h-4 w-4 mr-2 text-yellow-400" />
                      Review Teacher
                    </Button>
                  )}
                  {isReviewed && (
                    <span className="inline-block mt-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                      Reviewed
                    </span>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Review Modal */}
      <Dialog
        open={reviewModal.open}
        onOpenChange={open =>
          setReviewModal({ open, session: reviewModal.session })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              How was your lesson with {reviewModal.session?.teacher.name}?
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setReviewRating(n)}
                  className="p-1"
                  aria-label={`${n} star`}
                >
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
