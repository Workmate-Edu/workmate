"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { FileIcon } from "lucide-react"

interface Session {
  _id: string
  startTime: string
  endTime: string
  duration: number
  meetingLink: string
  status: string
  recurrence?: {
    isRecurring: boolean
    pattern: string
    startDate: string
    endDate: string
  }
}

interface CourseDetails {
  courseId: string
  teacherId: string
  startDate: string
  status: string
  title: string
  description: string
  subject: {
    area: string
    name: string
    level: string
    nextCall?: {
      date: string
      time: string
    }
  }
  structure: {
    duration: {
      weeks: number
      totalHours: number
      sessionsPerWeek: number
    }
    format: string
    sessionTypes: Array<{
      type: string
      duration: number
      frequency: string
    }>
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
  sessions?: Session[]
}

interface CourseDocument {
  id: string
  name: string
  description?: string
  url: string
  format: string
  size: number
  uploadedAt: string
}

interface PageProps {
  params: {
    courseId: string
  }
}

export default function CoursePage({ params }: PageProps) {
  const [course, setCourse] = useState<CourseDetails | null>(null)
  const [documents, setDocuments] = useState<CourseDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const courseId = params.courseId.includes('-') 
          ? params.courseId.split('-')[0] 
          : params.courseId

        // Fetch course details with sessions included
        const courseResponse = await fetch(`/api/student/courses/${courseId}`)
        if (!courseResponse.ok) throw new Error('Failed to fetch course')
        const courseData = await courseResponse.json()

        // Fetch additional sessions if needed
        const sessionsResponse = await fetch(`/api/student/courses/${courseId}?type=sessions`)
        const sessionsData = await sessionsResponse.ok ? await sessionsResponse.json() : []

        // Fetch course documents
        const docsResponse = await fetch(`/api/student/courses/${params.courseId}/documents`)
        if (docsResponse.ok) {
          const docsData = await docsResponse.json()
          setDocuments(docsData)
        }

        setCourse({
          ...courseData,
          sessions: sessionsData
        })
      } catch (error) {
        console.error('Error fetching course details:', error)
        toast.error('Course not found or you are not enrolled')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [params.courseId])

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Course not found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{course.title}</h1>
          <p className="text-muted-foreground">{course.description}</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Subject</h3>
                <p className="text-sm text-muted-foreground">
                  {course.subject.area} - {course.subject.name}
                </p>
                <p className="text-sm text-muted-foreground">Level: {course.subject.level}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Duration</h3>
                <p className="text-sm text-muted-foreground">
                  {course.structure.duration.weeks} weeks
                </p>
                <p className="text-sm text-muted-foreground">
                  {course.structure.duration.sessionsPerWeek} sessions per week
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Progress</h3>
                <Progress value={33} className="w-full" />
                <p className="text-sm text-muted-foreground mt-2">33% Complete</p>
              </div>
              {course.subject.nextCall && (
                <div>
                  <h3 className="font-semibold mb-2">Next Scheduled Call</h3>
                  <Badge variant="secondary">
                    {course.subject.nextCall.date} at {course.subject.nextCall.time}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="curriculum">
          <TabsList>
            <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
          </TabsList>
          <TabsContent value="curriculum" className="mt-6">
            <div className="space-y-6">
              {course.curriculum.map((week) => (
                <Card key={week.week}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Week {week.week}: {week.theme}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {week.sessions.map((session, index) => (
                        <div key={index} className="border-l-2 border-primary pl-4">
                          <h4 className="font-medium">
                            Session {index + 1}: {session.topic}
                          </h4>
                          <div className="mt-2 space-y-2">
                            <div>
                              <h5 className="text-sm font-medium">Objectives:</h5>
                              <ul className="list-disc list-inside text-sm text-muted-foreground">
                                {session.objectives.map((objective, i) => (
                                  <li key={i}>{objective}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h5 className="text-sm font-medium">Activities:</h5>
                              <ul className="list-disc list-inside text-sm text-muted-foreground">
                                {session.activities.map((activity, i) => (
                                  <li key={i}>{activity}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="sessions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                {course.sessions && course.sessions.length > 0 ? (
                  <div className="space-y-4">
                    {course.sessions.map((session) => (
                      <div
                        key={session._id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            {new Date(session.startTime).toLocaleDateString()} at{' '}
                            {new Date(session.startTime).toLocaleTimeString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Duration: {session.duration} minutes
                          </p>
                          {session.recurrence && session.recurrence.isRecurring && (
                            <Badge variant="outline" className="mt-1">
                              Recurring {session.recurrence.pattern}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={session.status === 'scheduled' ? 'default' : 'secondary'}>
                            {session.status}
                          </Badge>
                          {session.meetingLink && (
                            <a
                              href={session.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline"
                            >
                              Join Meeting
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No upcoming sessions scheduled.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="materials" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Materials</CardTitle>
              </CardHeader>
              <CardContent>
                {documents.length > 0 ? (
                  <div className="space-y-4">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FileIcon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            {doc.description && (
                              <p className="text-sm text-muted-foreground">{doc.description}</p>
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
                ) : (
                  <p className="text-muted-foreground">No materials available yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}