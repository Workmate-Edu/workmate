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
} from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useRouter } from "next/navigation"

interface Child {
  id: string
  name: string
  email: string
  grade?: string
  subjects?: Array<{
    name: string
    teacher?: { name: string }
    progress?: number
  }>
  assessmentStatus: {
    exists: boolean
    status: "none" | "pending" | "assigned"
    canCreate: boolean
    canEdit: boolean
  }
}

interface Session {
  id: string
  student: { id: string; name: string }
  subject: { name: string; area: string }
  startTime: string
  endTime: string
  status: string
  meetingLink?: string
}

export default function ParentDashboardPage() {
  const { data: session } = useSession()
  const [children, setChildren] = useState<Child[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<any>(null)
  const [availabilities, setAvailabilities] = useState<Record<string, any>>({})
  const router = useRouter()

  // Fetch children
  useEffect(() => {
    async function fetchChildren() {
      try {
        const res = await fetch("/api/parent/children")
        if (!res.ok) throw new Error("Failed to fetch children")
        const data = await res.json()
        setChildren(data.children || [])
      } finally {
        setLoading(false)
      }
    }
    fetchChildren()
  }, [])

  // Fetch subscription
  useEffect(() => {
    fetch("/api/subscription/status")
      .then(res => res.json())
      .then(data => setSubscription(data.subscription))
      .catch(() => setSubscription(null))
  }, [])

  // Fetch upcoming sessions
  useEffect(() => {
    async function fetchSessions() {
      try {
        const res = await fetch("/api/parent/children-sessions")
        if (!res.ok) throw new Error("Failed to fetch sessions")
        const data = await res.json()
        setSessions(data)
      } catch (err) {
        console.error(err)
      }
    }
    fetchSessions()
  }, [])

  // Fetch all availabilities for children
  useEffect(() => {
    async function fetchAvailabilities() {
      if (!children.length) return
      const results: Record<string, any> = {}
      await Promise.all(children.map(async child => {
        try {
          const res = await fetch(`/api/parent/children/${child.id}/availability`)
          if (res.ok) {
            results[child.id] = await res.json()
          }
        } catch {}
      }))
      setAvailabilities(results)
    }
    fetchAvailabilities()
  }, [children])

  const getChildAllowedSubjects = (childId: string) => {
    if (!subscription) return []
    return subscription.subjects
      ?.filter((s: any) => s.childId === childId)
      .map((s: any) => s.subject) || []
  }

  const getParentAllowedSubjects = () => {
    if (!subscription || !session?.user?.id) return []
    return subscription.subjects
      ?.filter((s: any) => s.childId === session.user.id)
      .map((s: any) => s.subject) || []
  }

  const renderAssessmentButton = (child: Child) => {
    const { assessmentStatus } = child

    if (!assessmentStatus.exists && assessmentStatus.canCreate) {
      return (
        <Button variant="default" className="w-full mt-3" asChild>
          <Link href={`/dashboard/parent/children/${child.id}/assessment`}>
            <ClipboardCheck className="mr-2 h-4 w-4" />
            Create Initial Assessment
          </Link>
        </Button>
      )
    }
    if (assessmentStatus.status === "pending" && assessmentStatus.canEdit) {
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
                      {child.name} needs an initial assessment to help teachers understand their learning needs.
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

      {/* Teacher Pairing Pending Alert (with availability) */}
      {children.some(c => c.assessmentStatus.exists && c.assessmentStatus.status === "pending") && (
        <Alert variant="info">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Teacher Pairing Pending</AlertTitle>
          <AlertDescription>
            <div className="space-y-2">
              {children
                .filter(c => c.assessmentStatus.exists && c.assessmentStatus.status === "pending")
                .map(child => {
                  const hasAvail = Boolean(availabilities[child.id])
                  return (
                    <div key={child.id} className="flex items-center justify-between">
                      <span>
                        {child.name}'s assessment is submitted and awaiting teacher pairing.
                      </span>
                      <Button
                        variant={hasAvail ? "secondary" : "default"}
                        size="sm"
                        asChild
                      >
                        <Link href={`/dashboard/parent/children/${child.id}/availability`}>
                          <Plus className="mr-1 h-4 w-4" />
                          {hasAvail ? "Edit Availability" : "Create Availability"}
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
          <div className="space-y-4">
            {sessions.slice(0, 3).map(sess => (
              <Card key={sess.id} className="p-4 flex justify-between items-start">
                <div>
                  <h3 className="font-medium">
                    {sess.subject.name} ({sess.subject.area})
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Student: {sess.student.name}
                  </p>
                  <div className="flex items-center gap-4 text-sm mt-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {new Date(sess.startTime).toLocaleDateString()}{" "}
                      {new Date(sess.startTime).toLocaleTimeString()} –{" "}
                      {new Date(sess.endTime).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                {sess.meetingLink && (
                  <Button variant="outline" asChild>
                    <a href={sess.meetingLink} target="_blank" rel="noopener noreferrer">
                      <Video className="mr-2 h-4 w-4" />
                      Join
                    </a>
                  </Button>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Parent Self‑Learning */}
      {getParentAllowedSubjects().length > 0 && (
        <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow border-2 border-primary/40">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/50" />
          <div className="p-6 flex flex-col justify-between h-full">
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">
                    {session?.user?.name} (You)
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {session?.user?.email}
                  </p>
                </div>
                <Badge variant="default">Parent</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium flex items-center gap-1">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  Subscribed Subjects
                </p>
                <div className="flex flex-wrap gap-2">
                  {getParentAllowedSubjects().map((subj, idx) => (
                    <Badge key={idx} variant="secondary">
                      {subj}
                    </Badge>
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
          const hasAvail = Boolean(availabilities[child.id])
          return (
            <Card
              key={child.id}
              className="relative overflow-hidden group hover:shadow-lg transition-shadow"
            >
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
                        allowed.map((s, i) => <Badge key={i} variant="secondary">{s}</Badge>)
                      ) : (
                        <span className="text-xs text-muted-foreground">No subscription</span>
                      )}
                    </div>
                  </div>

                  {/* Subject Count */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium flex items-center gap-1">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        Subjects
                      </p>
                      <p className="text-2xl font-bold">{child.subjects?.length || 0}</p>
                    </div>
                  </div>

                  {/* Progress Bars */}
                  {child.subjects && child.subjects.length > 0 && (
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
                      <GraduationCap className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </Link>
                  <Link href={`/dashboard/parent/messages`}>
                    <Button variant="outline" className="w-full">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Message Teachers
                    </Button>
                  </Link>
                  <Link href={`/dashboard/parent/children/${child.id}/availability`}>
                    <Button
                      variant={hasAvail ? "secondary" : "default"}
                      className="w-full"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {hasAvail ? "Edit Availability" : "Create Availability"}
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
