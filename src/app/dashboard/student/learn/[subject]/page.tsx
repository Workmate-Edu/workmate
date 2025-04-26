"use client"

import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Users, Video } from 'lucide-react'

export default function SubjectLearningPage() {
  const { subject } = useParams()
  const { data: session } = useSession()

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold capitalize">{subject} Learning</h1>
          <p className="text-muted-foreground mt-2">
            Access your live classes and learning materials
          </p>
        </div>

        {/* Next Class Card */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Next Live Class</h2>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Video className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-medium">Introduction to {subject}</p>
              <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Tomorrow, 10:00 AM
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  60 minutes
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  4 students
                </span>
              </div>
            </div>
            <Button className="ml-auto">
              Join Class
            </Button>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-4">
            <h3 className="font-medium mb-2">Schedule New Class</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Book a session with your teacher
            </p>
            <Button variant="outline" className="w-full">Book Session</Button>
          </Card>

          <Card className="p-4">
            <h3 className="font-medium mb-2">Learning Materials</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Access study materials
            </p>
            <Button variant="outline" className="w-full">View Materials</Button>
          </Card>

          <Card className="p-4">
            <h3 className="font-medium mb-2">Progress Tracker</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Track your learning journey
            </p>
            <Button variant="outline" className="w-full">View Progress</Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
