"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { FiBook, FiUsers, FiCalendar, FiPlus } from "react-icons/fi"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function TeacherClassesPage() {
  const mockClasses = [
    {
      id: 1,
      subject: "Advanced Mathematics",
      grade: "10th Grade",
      schedule: "Mon, Wed, Fri - 9:00 AM",
      room: "Room 301",
      totalStudents: 25,
      averagePerformance: 85,
      attendance: 92,
      nextClass: "2024-02-23T09:00:00",
      topics: ["Algebra", "Calculus", "Trigonometry"],
      pendingAssignments: 3,
    },
    {
      id: 2,
      subject: "Physics",
      grade: "11th Grade",
      schedule: "Tue, Thu - 10:30 AM",
      room: "Lab 2B",
      totalStudents: 20,
      averagePerformance: 78,
      attendance: 88,
      nextClass: "2024-02-22T10:30:00",
      topics: ["Mechanics", "Thermodynamics", "Optics"],
      pendingAssignments: 2,
    },
    {
      id: 3,
      subject: "Chemistry",
      grade: "10th Grade",
      schedule: "Mon, Wed - 2:00 PM",
      room: "Lab 1A",
      totalStudents: 22,
      averagePerformance: 82,
      attendance: 90,
      nextClass: "2024-02-23T14:00:00",
      topics: ["Organic Chemistry", "Chemical Bonding"],
      pendingAssignments: 1,
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
              <FiCalendar className="w-4 h-4 mr-2" />
              Schedule
            </Button>
            <Button>
              <FiPlus className="w-4 h-4 mr-2" />
              Create Class
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
                <FiUsers className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <h3 className="text-2xl font-bold">142</h3>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <FiCalendar className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Hours/Week</p>
                <h3 className="text-2xl font-bold">24</h3>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <FiBook className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Performance</p>
                <h3 className="text-2xl font-bold">82%</h3>
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
                    <div className="flex items-center space-x-2">
                      <h3 className="text-xl font-semibold">{class_.subject}</h3>
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                        {class_.grade}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Room: {class_.room} • {class_.schedule}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Performance</p>
                    <div className="flex items-center space-x-2">
                      <Progress value={class_.averagePerformance} className="h-2" />
                      <span className="text-sm font-medium">{class_.averagePerformance}%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Attendance</p>
                    <div className="flex items-center space-x-2">
                      <Progress value={class_.attendance} className="h-2" />
                      <span className="text-sm font-medium">{class_.attendance}%</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Students</p>
                    <p className="font-medium">{class_.totalStudents}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Next Class</p>
                    <p className="font-medium">{formatNextClass(class_.nextClass)}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Current Topics</p>
                  <div className="flex flex-wrap gap-2">
                    {class_.topics.map((topic, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                {class_.pendingAssignments > 0 && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-600">
                      {class_.pendingAssignments} pending assignment{class_.pendingAssignments > 1 ? 's' : ''} to review
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
