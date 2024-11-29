"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { FiVideo, FiUsers, FiCalendar, FiLink } from "react-icons/fi"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"

export default function LiveClassPage() {
  const [meetLink, setMeetLink] = useState("")

  // Function to create a new Google Meet link
  const createMeetLink = async () => {
    // TODO: Integrate with Google Calendar API to create a meet link
    const tempLink = `https://meet.google.com/${Math.random().toString(36).substring(7)}`
    setMeetLink(tempLink)
  }

  const upcomingClasses = [
    {
      id: 1,
      subject: "Mathematics",
      time: "10:00 AM",
      date: "Today",
      students: 25,
      status: "upcoming",
    },
    {
      id: 2,
      subject: "Physics",
      time: "2:00 PM",
      date: "Today",
      students: 20,
      status: "upcoming",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight">Live Class</h2>
          <Button onClick={createMeetLink}>
            <FiVideo className="w-4 h-4 mr-2" />
            Start New Class
          </Button>
        </div>

        {/* Active Class Card */}
        {meetLink && (
          <Card className="p-6 bg-primary/5 border-primary/20">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">Active Class Session</h3>
                  <p className="text-sm text-muted-foreground">Share this link with your students</p>
                </div>
                <Button variant="outline" onClick={() => navigator.clipboard.writeText(meetLink)}>
                  <FiLink className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
              </div>
              <Input value={meetLink} readOnly />
              <div className="flex gap-4">
                <Button onClick={() => window.open(meetLink, "_blank")}>
                  Join Class
                </Button>
                <Button variant="outline" onClick={() => setMeetLink("")}>
                  End Class
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <FiVideo className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-medium">Active Sessions</h3>
                <p className="text-2xl font-bold">{meetLink ? "1" : "0"}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <FiUsers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-medium">Total Students</h3>
                <p className="text-2xl font-bold">45</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <FiCalendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-medium">Classes Today</h3>
                <p className="text-2xl font-bold">{upcomingClasses.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Upcoming Classes */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Upcoming Classes</h3>
          <div className="grid gap-4">
            {upcomingClasses.map((classItem) => (
              <Card key={classItem.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <FiVideo className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">{classItem.subject}</h4>
                      <p className="text-sm text-muted-foreground">
                        {classItem.date} at {classItem.time} • {classItem.students} students
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Schedule
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
