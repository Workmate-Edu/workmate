"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { FileIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Calendar, Clock, Video } from "lucide-react"

interface Session {
  _id: string;
  subject: {
    name: string;
    area: string;
  };
  teacherId: {
    _id: string;
    name: string;
    email: string;
  };
  startTime: string;
  endTime: string;
  duration: number;
  meetingLink: string;
  status: string;
}

interface CourseDetails {
  id: string
  name: string
  area: string
  progress: number // Add progress to interface
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
  const [sessions, setSessions] = useState<Session[]>([])
  const [activeTab, setActiveTab] = useState('curriculum')

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

  const fetchSessions = async () => {
    try {
      console.log('Fetching sessions for course:', params.courseId)
      const response = await fetch(`/api/student/courses/${params.courseId}/sessions`)
      if (!response.ok) throw new Error('Failed to fetch sessions')
      const data = await response.json()
      console.log('Sessions data:', data)
      setSessions(data)
    } catch (error) {
      console.error('Error fetching sessions:', error)
      toast({
        title: "Error",
        description: "Failed to load sessions",
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    fetchSessions()
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
          <h1 className="text-2xl font-bold capitalize">{course.title}</h1>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Subject</h3>
               <p className="text-sm text-muted-foreground capitalize">
  {course.subject.area} - {course.subject.name}
</p>

              </div>
              <div>
                <h3 className="font-semibold mb-2">Estimated Duration</h3>
                <p className="text-sm text-muted-foreground">
                  {course.structure.duration.weeks} weeks
                </p>
               
              </div>
              <div>
                <h3 className="font-semibold mb-2">Progress</h3>
                <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span>{course?.progress ?? 0}%</span>
          </div>
          <Progress 
            value={course?.progress} 
            className={cn(
              "h-2",
              (course?.progress || 0) >= 80 ? "bg-green-200" :
              (course?.progress || 0) >= 50 ? "bg-blue-200" :
              "bg-yellow-200"
            )}
          />
          {/* Add debug info */}
          <p className="text-xs text-muted-foreground">
            Debug - Raw progress value: {JSON.stringify(course?.progress)}
          </p>
        </div>
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
                {sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No upcoming sessions scheduled
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <Card key={session._id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{format(new Date(session.startTime), 'PPP')}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{format(new Date(session.startTime), 'p')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {session.duration} minutes
                      </Badge>
                      <Badge>
                        {session.status}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => window.open(session.meetingLink, '_blank')}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Join Session
                  </Button>
                </div>
              </Card>
            ))}
          </div>
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