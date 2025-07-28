"use client"

import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, Plus, ClipboardCheck, Edit, BookOpen, GraduationCap, MessageSquare } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { toast } from "sonner"

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

interface Subscription {
  // the API returns an array of { childId, subject } pairs
  subjects: Array<{ childId: string; subject: string }>
}

export default function ChildrenPage() {
  const { data: session } = useSession()
  const [children, setChildren] = useState<Child[]>([])
  const [availabilities, setAvailabilities] = useState<Record<string, any>>({})
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  // 1) Fetch children
  useEffect(() => {
    async function fetchChildren() {
      try {
        const res = await fetch("/api/parent/children")
        if (!res.ok) throw new Error()
        const { children: kids } = await res.json()
        setChildren(kids || [])
      } catch {
        toast.error("Failed to load children")
      } finally {
        setLoading(false)
      }
    }
    fetchChildren()
  }, [])

  // 2) Fetch subscription status
  useEffect(() => {
    async function fetchSubscription() {
      try {
        const res = await fetch("/api/subscription/status")
        if (!res.ok) throw new Error()
        const { subscription } = await res.json()
        setSubscription(subscription)
      } catch {
        setSubscription(null)
      }
    }
    fetchSubscription()
  }, [])

  // 3) Fetch each child's availability (to drive the "Create/Edit Availability" button state)
  useEffect(() => {
    if (!children.length) return
    async function fetchAll() {
      const out: Record<string, any> = {}
      await Promise.all(
        children.map(async (c) => {
          try {
            const res = await fetch(`/api/parent/children/${c.id}/availability`)
            if (res.ok) out[c.id] = await res.json()
          } catch {}
        })
      )
      setAvailabilities(out)
    }
    fetchAll()
  }, [children])

  // helper: list of subscribed subjects for a given child
  const getChildAllowedSubjects = (childId: string) =>
    subscription?.subjects
      .filter((s) => s.childId === childId)
      .map((s) => s.subject) || []

  // helper: render the assessment CTA
  const renderAssessmentButton = (child: Child) => {
    const { exists, status, canCreate, canEdit } = child.assessmentStatus
    if (!exists && canCreate) {
      return (
        <Button variant="default" className="w-full mt-4" asChild>
          <Link href={`/dashboard/parent/children/${child.id}/assessment`}>
            <ClipboardCheck className="mr-2 h-4 w-4" />
            Create Initial Assessment
          </Link>
        </Button>
      )
    }
    if (status === "pending" && canEdit) {
      return (
        <Button variant="secondary" className="w-full mt-4" asChild>
          <Link href={`/dashboard/parent/children/${child.id}/assessment/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Initial Assessment
          </Link>
        </Button>
      )
    }
    if (status === "assigned") {
      return (
        <Badge
          variant="secondary"
          className="w-full mt-4 py-3 flex items-center justify-center"
        >
          <GraduationCap className="mr-2 h-4 w-4" />
          Initial Assessment Completed
        </Badge>
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
    <div className="container py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">My Children</h1>
          <p className="text-muted-foreground">
            {children.length > 0
              ? "Monitor your children's academic progress and activities"
              : "Get started by adding your child to Workmate"}
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/parent/children/add">
            <Plus className="mr-2 h-4 w-4" />
            Add Child
          </Link>
        </Button>
      </div>

      {children.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">No Children Registered</h3>
          <p className="text-muted-foreground mt-1 mb-6">
            Start managing your child's education journey
          </p>
          <Button asChild size="lg">
            <Link href="/dashboard/parent/children/add">
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Child
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {children.map((child) => {
            const hasAvail = Boolean(availabilities[child.id])
            const subscribed = getChildAllowedSubjects(child.id)

            return (
              <Card
                key={child.id}
                className="relative overflow-hidden group hover:shadow-lg transition-shadow"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/50" />
                <div className="p-6 flex flex-col justify-between h-full">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-semibold capitalize">{child.name}</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {child.email}
                      </p>
                    </div>
                    <Badge variant={child.grade ? "default" : "secondary"}>
                      {child.grade || "No Grade"}
                    </Badge>
                  </div>

                  {/* Subscribed Subjects */}
                  <div className="space-y-1 mb-4">
                    <p className="text-sm font-medium flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      Subscribed Subjects
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {subscribed.length > 0 ? (
                        subscribed.map((subj, i) => (
                          <Badge key={i} variant="secondary">
                            {subj}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          No subscriptions
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Active Subjects Count */}
                  <div className="space-y-1 mb-4">
                    <p className="text-sm font-medium flex items-center gap-1">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      Active Subjects
                    </p>
                    <p className="text-2xl font-bold">
                      {child.subjects?.length || 0}
                    </p>
                  </div>

                  {/* Progress Bars */}
                  {child.subjects && child.subjects.length > 0 && (
                    <div className="space-y-3 mb-6">
                      {child.subjects.map((subj, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <p className="font-medium capitalize">{subj.name}</p>
                            {subj.teacher && (
                              <p className="text-muted-foreground">
                                {subj.teacher.name}
                              </p>
                            )}
                          </div>
                          <Progress
                            value={subj.progress || 0}
                            className="h-1.5"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <Link href={`/dashboard/parent/children/${child.id}`}>
                      <Button
                        variant="outline"
                        className="w-full group-hover:border-primary/50 transition-colors"
                      >
                        <GraduationCap className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </Link>
                    <Link href={`/dashboard/parent/messages`}>
                      <Button
                        variant="outline"
                        className="w-full group-hover:border-primary/50 transition-colors"
                      >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Message Teachers
                      </Button>
                    </Link>
                  </div>

                  {/* Availability */}
                  <Link href={`/dashboard/parent/children/${child.id}/availability`}>
                    <Button
                      variant={hasAvail ? "secondary" : "default"}
                      className="w-full mb-3"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {hasAvail
                        ? `View ${child.name.split(" ")[0]}'s Availability`
                        : `Create ${child.name.split(" ")[0]}'s Availability`}
                    </Button>
                  </Link>

                  {/* Assessment */}
                  {renderAssessmentButton(child)}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
