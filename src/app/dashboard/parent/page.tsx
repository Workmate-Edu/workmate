"use client"

import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { BookOpen, GraduationCap, Users, MessageSquare, Plus, ClipboardCheck, Edit } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { getAllowedSubjectsForUser } from "@/lib/subscription-access"

interface Child {
  id: string;
  name: string;
  email: string;
  grade?: string;
  subjects?: Array<{
    name: string;
    teacher?: {
      name: string;
    };
    progress?: number;
  }>;
  assessmentStatus: {
    exists: boolean;
    status: 'none' | 'pending' | 'assigned';
    canCreate: boolean;
    canEdit: boolean;
  };
}

export default function ParentDashboardPage() {
  const { data: session } = useSession()
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<any>(null)

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const res = await fetch('/api/parent/children')
        if (!res.ok) throw new Error('Failed to fetch children')
        const data = await res.json()
        setChildren(data.children || [])
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchChildren()
  }, [])

  useEffect(() => {
    // Fetch subscription for parent
    fetch("/api/subscription/status")
      .then(res => res.json())
      .then(data => setSubscription(data.subscription))
      .catch(() => setSubscription(null))
  }, [])

  // Helper: get allowed subjects for a child from subscription
  const getChildAllowedSubjects = (childId: string) => {
    if (!subscription) return []
    return subscription.subjects
      ?.filter((s: any) => s.childId === childId)
      .map((s: any) => s.subject) || []
  }

  // Helper: get allowed subjects for parent (self-learning)
  const getParentAllowedSubjects = () => {
    if (!subscription || !session?.user?.id) return []
    return subscription.subjects
      ?.filter((s: any) => s.childId === session.user.id)
      .map((s: any) => s.subject) || []
  }

  const renderAssessmentButton = (child: Child) => {
    const { assessmentStatus } = child;

    if (!assessmentStatus.exists && assessmentStatus.canCreate) {
      return (
        <Button 
          variant="default" 
          className="w-full mt-3"
          asChild
        >
          <Link href={`/dashboard/parent/children/${child.id}/assessment`}>
            <ClipboardCheck className="mr-2 h-4 w-4" />
            Create Initial Assessment
          </Link>
        </Button>
      );
    }

    if (assessmentStatus.status === 'pending' && assessmentStatus.canEdit) {
      return (
        <Button 
          variant="secondary" 
          className="w-full mt-3"
          asChild
        >
          <Link href={`/dashboard/parent/children/${child.id}/assessment/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Inital Assessment
          </Link>
        </Button>
      );
    }

    if (assessmentStatus.status === 'assigned') {
      return (
        <div className="mt-3">
          <Badge 
            variant="secondary"
            className="w-full py-3 flex items-center justify-center"
          >
            <GraduationCap className="mr-2 h-4 w-4" />
            Inital Assessment Completed
          </Badge>
        </div>
      ); 
    }

    return null;
  };

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
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {session?.user?.name}</h1>
        <Button asChild>
          <Link href="/dashboard/parent/children/add">
            <Plus className="mr-2 h-4 w-4" />
            Add Child
          </Link>
        </Button>
      </div>

      <div>
        {children?.some(child => !child.assessmentStatus?.exists && child.assessmentStatus?.canCreate) && (
          <Alert variant="warning" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Initial Assessment Required</AlertTitle>
            <AlertDescription>
              <div className="space-y-2">
                {children
                  .filter(child => !child.assessmentStatus?.exists && child.assessmentStatus?.canCreate)
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
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Parent self-learning card if any */}
        {getParentAllowedSubjects().length > 0 && (
          <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow border-2 border-primary/40">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/50" />
            <div className="p-6 flex flex-col justify-between h-full">
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight">{session?.user?.name} (You)</h2>
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
                    {getParentAllowedSubjects().map((subject, idx) => (
                      <Badge key={idx} variant="secondary">{subject}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Children cards */}
        {children.map((child) => {
          const allowedSubjects = getChildAllowedSubjects(child.id)
          return (
            <Card key={child.id} className="relative overflow-hidden group hover:shadow-lg transition-shadow">
              {/* Top Accent Bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/50" />
              <div className="p-6 flex flex-col justify-between h-full">
                <div className="space-y-6">
                  {/* Header Section */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-semibold tracking-tight">{child.name}</h2>
                      <p className="text-sm text-muted-foreground mt-1">{child.email}</p>
                    </div>
                    <Badge variant={child.grade ? "default" : "secondary"}>
                      {child.grade || 'No Grade'}
                    </Badge>
                  </div>

                  {/* Subscribed subjects for this child */}
                  <div className="space-y-1">
                    <p className="text-sm font-medium flex items-center gap-1">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      Subscribed Subjects
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {allowedSubjects.length > 0
                        ? allowedSubjects.map((subject, idx) => (
                            <Badge key={idx} variant="secondary">{subject}</Badge>
                          ))
                        : <span className="text-xs text-muted-foreground">No subscription</span>
                      }
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium flex items-center gap-1">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        Subjects
                      </p>
                      <p className="text-2xl font-bold">
                        {child.subjects?.length || 0}
                      </p>
                    </div>
                  </div>

                  {/* Subjects List */}
                  {child.subjects && child.subjects.length > 0 && (
                    <div className="space-y-3">
                      {child.subjects.map((subject, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <p className="font-medium">{subject.name}</p>
                            {subject.teacher && (
                              <p className="text-muted-foreground">{subject.teacher.name}</p>
                            )}
                          </div>
                          <Progress value={subject.progress || 0} className="h-1.5" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Links */}
                  <div className="grid grid-cols-2 gap-3">
                    <Link href={`/dashboard/parent/children/${child.id}`}>
                      <Button variant="outline" className="w-full group-hover:border-primary/50 transition-colors">
                        <GraduationCap className="mr-2 h-4 w-4" />
                        View Progress
                      </Button>
                    </Link>
                    <Link href={`/dashboard/parent/messages`}>
                      <Button variant="outline" className="w-full group-hover:border-primary/50 transition-colors">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Message Teachers
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Assessment Button - Now at bottom */}
                {renderAssessmentButton(child)}
              </div>
            </Card>
          )
        })}
      </div>

      {children.length === 0 && !loading && (
        <Card className="p-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">No Children Registered</h3>
          <p className="text-muted-foreground mt-1 mb-6">Start managing your child's education journey</p>
          <Button asChild size="lg">
            <Link href="/dashboard/parent/children/add">
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Child
            </Link>
          </Button>
        </Card>
      )}
    </div>
  )
}