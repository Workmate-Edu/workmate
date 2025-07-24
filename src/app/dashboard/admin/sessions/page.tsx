"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Loader2, Calendar, User, Users, BookOpen, CheckCircle, Clock, XCircle, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Session {
  _id: string
  teacher: { _id: string; name: string }
  student: { _id: string; name: string }
  subject: string
  startTime: string
  endTime: string
  status: string
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700",
  "teacher-completed": "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  active: "bg-indigo-100 text-indigo-700"
}

const FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "scheduled", label: "Scheduled" },
  { value: "teacher-completed", label: "Teacher Marked Complete" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" }
]

function formatDateTime(date: string) {
  const d = new Date(date)
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  })
}

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>("all")

  useEffect(() => {
    async function fetchSessions() {
      setLoading(true)
      const res = await fetch("/api/sessions/admin")
      const data = res.ok ? await res.json() : []
      setSessions(data)
      setLoading(false)
    }
    fetchSessions()
  }, [])

  const handleMarkCompleted = async (sessionId: string) => {
    setMarking(sessionId)
    await fetch(`/api/sessions/${sessionId}/complete`, { method: "POST" })
    setSessions(sessions =>
      sessions.map(s =>
        s._id === sessionId ? { ...s, status: "completed" } : s
      )
    )
    setMarking(null)
  }
  

  // Filter sessions by status
  const filteredSessions = filter === "all"
    ? sessions
    : sessions.filter(s => s.status === filter)

  return (
    <div className="max-w-7xl mx-auto py-8 px-2 sm:px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-primary">All Sessions</h1>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="border rounded px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {FILTER_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
      {loading ? (
        <div className="flex items-center gap-2 justify-center py-16">
          <Loader2 className="animate-spin" /> Loading...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSessions.length === 0 ? (
            <Card className="p-8 flex flex-col items-center justify-center col-span-full">
              <Calendar className="h-12 w-12 text-muted-foreground mb-2" />
              <div className="text-muted-foreground text-lg">No sessions found.</div>
            </Card>
          ) : (
            filteredSessions.map(s => (
              <Card key={s._id} className="p-6 flex flex-col gap-4 shadow-md hover:shadow-lg transition">
                <div className="flex items-center gap-3 mb-2">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-semibold capitalize",
                    STATUS_COLORS[s.status] || "bg-muted text-muted-foreground"
                  )}>
                    {s.status.replace("-", " ")}
                  </span>
                  {s.status === "completed" && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {s.status === "teacher-completed" && (
                    <Clock className="h-5 w-5 text-yellow-500" />
                  )}
                  {s.status === "cancelled" && (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Teacher:</span>
                    <span>{s.teacher?.name || s.teacher?._id}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-emerald-500" />
                    <span className="font-medium">Student:</span>
                    <span>{s.student?.name || s.student?._id}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <BookOpen className="h-4 w-4 text-violet-500" />
                    <span className="font-medium">Subject:</span>
                    <span>{s.subject}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-orange-500" />
                    <span className="font-medium">Start:</span>
                    <span>{formatDateTime(s.startTime)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-orange-500" />
                    <span className="font-medium">End:</span>
                    <span>{formatDateTime(s.endTime)}</span>
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  {s.status === "teacher-completed" && (
                    <Button
                      size="sm"
                      onClick={() => handleMarkCompleted(s._id)}
                      disabled={marking === s._id}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {marking === s._id ? "Marking..." : "Mark Completed"}
                    </Button>
                  )}
                  {s.status === "completed" && (
                    <span className="text-green-600 font-semibold text-sm flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" /> Completed
                    </span>
                  )}
                  {s.status !== "teacher-completed" && s.status !== "completed" && (
                    <span className="text-muted-foreground text-xs">Waiting for teacher to mark complete</span>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
