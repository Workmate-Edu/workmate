"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, BookOpen } from "lucide-react"
import { format, isPast } from "date-fns"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface TeacherSession {
  _id: string
  subject: {
    name: string
    area: string
  }
  student: {
    name: string
    email: string
  }
  startTime: string
  endTime: string
  duration: number
  meetingLink: string
  status: 'scheduled' | 'active' | 'completed' | 'cancelled'
}

export default function TeacherSchedulePage() {
  const { data: session } = useSession()
  const [sessions, setSessions] = useState<TeacherSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/teacher/sessions')
        if (!response.ok) throw new Error('Failed to fetch sessions')
        const data = await response.json()
        setSessions(data)
      } catch (error) {
        console.error('Error fetching sessions:', error)
        toast.error('Failed to load sessions')
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.id) {
      fetchSessions()
    }
  }, [session?.user?.id])

  if (loading) {
    return <div className="flex items-center justify-center h-48">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Simplified Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Teaching Schedule</h1>
          <p className="text-muted-foreground">Manage your upcoming sessions</p>
        </div>
      </div>

      <div className="grid gap-4">
        {sessions.map((session) => (
          <Card key={session._id} className="overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start gap-4 p-4 md:p-6">
              {/* Session Details */}
              <div className="flex-1 min-w-0 space-y-3">
                {/* Subject & Status */}
                <div className="flex flex-wrap items-start gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <BookOpen className="h-4 w-4 flex-shrink-0" />
                    <span className="font-medium truncate">
                      {session.subject.name}
                      <span className="text-sm text-muted-foreground ml-1">
                        ({session.subject.area})
                      </span>
                    </span>
                  </div>
                  <Badge className={cn(
                    "whitespace-nowrap",
                    isPast(new Date(session.startTime)) ? "bg-red-500" : "bg-green-500"
                  )}>
                    {session.status}
                  </Badge>
                </div>

                {/* Time & Student Info */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm">
                  <div className="flex items-center">
                    <Clock className="mr-1 h-4 w-4 flex-shrink-0" />
                    <span>{format(new Date(session.startTime), 'PPP p')}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="mr-1 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{session.student.name}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                {/* <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  View Details
                </Button> */}
                {session.meetingLink && (
                  <Button 
                    size="sm"
                    className="w-full sm:w-auto"
                    disabled={isPast(new Date(session.endTime))}
                    onClick={() => window.open(session.meetingLink, '_blank')}
                  >
                    Join Session
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
