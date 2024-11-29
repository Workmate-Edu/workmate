"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { FiBook, FiClock, FiUsers, FiCalendar } from "react-icons/fi"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function StudentClassesPage() {
  const mockClasses = [
    {
      id: 1,
      subject: "Advanced Mathematics",
      teacher: "Dr. Johnson",
      schedule: "Mon, Wed, Fri - 9:00 AM",
      room: "Room 301",
      progress: 65,
      nextClass: "2024-02-23T09:00:00",
      totalStudents: 25,
      announcements: 2,
    },
    {
      id: 2,
      subject: "Physics",
      teacher: "Ms. Thompson",
      schedule: "Tue, Thu - 10:30 AM",
      room: "Lab 2B",
      progress: 45,
      nextClass: "2024-02-22T10:30:00",
      totalStudents: 20,
      announcements: 1,
    },
    {
      id: 3,
      subject: "English Literature",
      teacher: "Mr. Williams",
      schedule: "Mon, Wed - 2:00 PM",
      room: "Room 205",
      progress: 80,
      nextClass: "2024-02-23T14:00:00",
      totalStudents: 22,
      announcements: 3,
    },
  ]

  const formatNextClass = (date: string) => {
    const nextClass = new Date(date)
    const now = new Date()
    const diffTime = nextClass.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Tomorrow"
    return nextClass.toLocaleDateString()
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight">My Classes</h2>
          <div className="space-x-2">
            <Button variant="outline">
              Schedule View
            </Button>
            <Button variant="outline">
              Join Class
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <FiBook className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Classes</p>
                <h3 className="text-2xl font-bold">6</h3>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-full">
                <FiClock className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Hours/Week</p>
                <h3 className="text-2xl font-bold">12</h3>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <FiUsers className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Classmates</p>
                <h3 className="text-2xl font-bold">67</h3>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <FiCalendar className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Next Class</p>
                <h3 className="text-lg font-bold">In 2 hrs</h3>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {mockClasses.map((class_) => (
            <Card key={class_.id} className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold">{class_.subject}</h3>
                    <p className="text-sm text-gray-500">
                      Teacher: {class_.teacher}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Course Progress</span>
                    <span>{class_.progress}%</span>
                  </div>
                  <Progress value={class_.progress} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Schedule</p>
                    <p className="font-medium">{class_.schedule}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Room</p>
                    <p className="font-medium">{class_.room}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Next Class</p>
                    <p className="font-medium">{formatNextClass(class_.nextClass)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Students</p>
                    <p className="font-medium">{class_.totalStudents}</p>
                  </div>
                </div>

                {class_.announcements > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600">
                      {class_.announcements} new announcement{class_.announcements > 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
