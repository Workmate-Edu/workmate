"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Video, User } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

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
  status: 'scheduled' | 'active' | 'completed' | 'cancelled'
  teacherId: {
    name: string
    email: string
  }
}

export default function StudentSchedulePage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSchedule()
  }, [])

  const fetchSchedule = async () => {
    try {
      const response = await fetch('/api/student/schedule')
      if (!response.ok) throw new Error('Failed to fetch schedule')
      const data = await response.json()
      setSessions(data)
    } catch (error) {
      toast.error("Failed to load schedule")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-48">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          {/* <h1 className="text-3xl font-bold">My Schedule</h1>
          <p className="text-muted-foreground">Upcoming class sessions</p> */}
        </div>
      </div>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-48 space-y-4">
            <Calendar className="h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">No upcoming sessions</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session) => (
            <Card key={session._id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{session.subject.name}</h3>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <Calendar className="mr-2 h-4 w-4" />
                        {format(new Date(session.startTime), 'PPP')}
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="mr-2 h-4 w-4" />
                        {format(new Date(session.startTime), 'p')}
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <User className="mr-2 h-4 w-4" />
                        {session.teacherId.name}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="default"
                    onClick={() => window.open(session.meetingLink, '_blank')}
                  >
                    <Video className="mr-2 h-4 w-4" />
                    Join Class
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
