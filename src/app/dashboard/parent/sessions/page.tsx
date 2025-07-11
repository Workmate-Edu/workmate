"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Calendar, Users, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface Session {
  id: string
  student: {
    id: string
    name: string
  }
  teacher: {
    name: string
    email: string
  }
  subject: {
    name: string
    area: string
  }
  startTime: string
  endTime: string
  duration: number
  meetingLink: string
  status: string
}

export default function ParentSchedulePage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSessions() {
      try {
        const response = await fetch('/api/parent/schedule')
        if (!response.ok) throw new Error('Failed to fetch schedule')
        const data = await response.json()
        setSessions(data)
      } catch (error) {
        console.error(error)
        toast.error("Failed to load schedule")
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [])

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
          {sessions.slice().reverse().map(session => (
            <Card key={session.id} className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">
                      {session.subject.name} - {session.subject.area}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Student: {session.student.name}
                    </p>
                  </div>
                  <Badge variant={session.status === 'scheduled' ? 'default' : 'secondary'}>
                    {session.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {new Date(session.startTime).toLocaleDateString()}
                  </p>
                  <p className="text-muted-foreground">
                    {new Date(session.startTime).toLocaleTimeString()} - 
                    {new Date(session.endTime).toLocaleTimeString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p>Teacher: {session.teacher.name}</p>
                    <p className="text-xs text-muted-foreground">{session.teacher.email}</p>
                  </div>
                </div>

                {session.meetingLink && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={session.meetingLink} target="_blank" rel="noopener noreferrer">
                      <Video className="h-4 w-4 mr-2" />
                      Join Meeting
                    </a>
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
