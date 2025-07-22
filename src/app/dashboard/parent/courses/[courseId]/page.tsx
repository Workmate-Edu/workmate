// app/(dashboard)/parent/courses/[courseId]/page.tsx
"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { FileIcon, Calendar, Clock, Video } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface Session {
  _id: string
  subject: { name: string; area: string }
  teacherId: { _id: string; name: string; email: string }
  startTime: string
  endTime: string
  duration: number
  meetingLink: string
  status: string
}

interface CourseDetails {
  id: string
  title: string
  description?: string
  subject: {
    name: string
    area: string
    level: string
    nextCall?: { date: string; time: string }
  }
  progress: number
  structure: {
    duration: { weeks: number; totalHours: number; sessionsPerWeek: number }
    format: string
    sessionTypes: Array<{ type: string; duration: number; frequency: string }>
  }
  curriculum: Array<{
    week: number
    theme: string
    sessions: Array<{
      type: string
      topic: string
      objectives: string[]
      activities: string[]
    }>
  }>
}

interface CourseDocument {
  id: string
  name: string
  description?: string
  url: string
}

interface PageProps {
  params: { courseId: string }
}

export default function ParentCoursePage({ params }: PageProps) {
  const [course, setCourse] = useState<CourseDetails | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [documents, setDocuments] = useState<CourseDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"curriculum" | "sessions" | "materials">("curriculum")

  useEffect(() => {
    async function fetchAll() {
      try {
        const rawId = params.courseId.split("-")[0] // strip any slug
        // 1) course details / curriculum
        const courseRes = await fetch(`/api/parent/courses/${rawId}`, { cache: "no-cache" })
        if (!courseRes.ok) throw new Error("Course not found")
        const courseData = await courseRes.json()

        // 2) sessions
        const sessionsRes = await fetch(
          `/api/parent/courses/${rawId}/sessions`, 
          { cache: "no-cache" }
        )
        const sessionsData = sessionsRes.ok ? await sessionsRes.json() : []

        // 3) materials
        const docsRes = await fetch(
          `/api/parent/courses/${rawId}/documents`, 
          { cache: "no-cache" }
        )
        const docsData = docsRes.ok ? await docsRes.json() : []

        setCourse(courseData)
        setSessions(sessionsData)
        setDocuments(docsData)
      } catch (err: any) {
        console.error(err)
        toast.error(err.message || "Failed to load course")
      } finally {
        setIsLoading(false)
      }
    }
    fetchAll()
  }, [params.courseId])

  if (isLoading) {
    return (
      <div className="animate-pulse p-6 space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-24 bg-gray-200 rounded" />
          <div className="h-24 bg-gray-200 rounded" />
          <div className="h-24 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Course not found or you’re not enrolled.
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <h1 className="text-2xl font-bold capitalize">{course.title}</h1>

      {/* Summary Card */}
      <Card>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold mb-1">Subject</h3>
            <p className="text-sm text-muted-foreground capitalize">
              {course.subject.area} — {course.subject.name}
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Duration</h3>
            <p className="text-sm text-muted-foreground">
              {course.structure.duration.weeks} weeks
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Progress</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Overall</span>
                <span>{course.progress}%</span>
              </div>
              <Progress
                value={course.progress}
                className={cn(
                  "h-2",
                  course.progress >= 80
                    ? "bg-green-200"
                    : course.progress >= 50
                    ? "bg-blue-200"
                    : "bg-yellow-200"
                )}
              />
            </div>
          </div>
          {course.subject.nextCall && (
            <div className="md:col-span-3">
              <h3 className="font-semibold mb-1">Next Call</h3>
              <Badge variant="secondary">
                {course.subject.nextCall.date} @ {course.subject.nextCall.time}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
        </TabsList>

        {/* Curriculum */}
        <TabsContent value="curriculum">
          <div className="space-y-6 mt-6">
            {course.curriculum.map((week) => (
              <Card key={week.week}>
                <CardHeader>
                  <CardTitle>
                    Week {week.week}: {week.theme}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {week.sessions.map((s, i) => (
                    <div key={i} className="border-l-2 border-primary pl-4 mb-4">
                      <h4 className="font-medium">
                        Session {i + 1}: {s.topic}
                      </h4>
                      <div className="mt-2 space-y-2">
                        <div>
                          <h5 className="text-sm font-semibold">Objectives</h5>
                          <ul className="list-disc list-inside text-sm text-muted-foreground">
                            {s.objectives.map((o, i) => (
                              <li key={i}>{o}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="text-sm font-semibold">Activities</h5>
                          <ul className="list-disc list-inside text-sm text-muted-foreground">
                            {s.activities.map((a, i) => (
                              <li key={i}>{a}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Sessions */}
        <TabsContent value="sessions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No sessions scheduled
                </p>
              ) : (
                <div className="space-y-4">
                  {sessions.map((s) => (
                    <Card key={s._id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{format(new Date(s.startTime), "PPP")}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{format(new Date(s.startTime), "p")}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{s.duration} min</Badge>
                            <Badge>{s.status}</Badge>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => window.open(s.meetingLink, "_blank")}
                        >
                          <Video className="h-4 w-4 mr-2" />
                          Join
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Materials */}
        <TabsContent value="materials" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Materials</CardTitle>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <p className="text-muted-foreground">No materials yet.</p>
              ) : (
                <div className="space-y-4">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between border p-4 rounded"
                    >
                      <div className="flex items-center gap-3">
                        <FileIcon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          {doc.description && (
                            <p className="text-sm text-muted-foreground">
                              {doc.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
