"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FiUsers, FiBook, FiTrendingUp, FiBell, FiClock } from "react-icons/fi"
import { useRouter } from "next/navigation"

export default function ParentDashboard() {
  const router = useRouter()
  // This would be fetched from the database in a real application
  const mockData = {
    children: [
      {
        id: 1,
        name: "John Doe Jr.",
        grade: "10th Grade",
        courses: [
          {
            id: 101,
            title: "Advanced Mathematics",
            teacher: "Dr. Sarah Johnson",
            progress: 75,
            nextClass: "2024-02-20 14:00"
          },
          {
            id: 102,
            title: "Physics",
            teacher: "Mr. Robert Smith",
            progress: 82,
            nextClass: "2024-02-21 10:00"
          }
        ]
      },
      {
        id: 2,
        name: "Jane Doe",
        grade: "8th Grade",
        courses: [
          {
            id: 201,
            title: "English Literature",
            teacher: "Ms. Emily Brown",
            progress: 88,
            nextClass: "2024-02-20 09:00"
          },
          {
            id: 202,
            title: "Biology",
            teacher: "Dr. Michael Green",
            progress: 90,
            nextClass: "2024-02-21 13:00"
          }
        ]
      }
    ],
    upcomingEvents: [
      {
        id: 1,
        title: "Parent-Teacher Meeting",
        date: "2024-02-25",
        time: "3:00 PM",
      },
      {
        id: 2,
        title: "School Concert",
        date: "2024-03-01",
        time: "6:00 PM",
      },
    ],
  }

  const navigateToCourse = (courseId: number, childId: number) => {
    router.push(`/dashboard/parent/courses/${courseId}?childId=${childId}`)
  }

  return (
    <DashboardLayout>
      {/* <div className="grid gap-6 md:grid-cols-2"> */}
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Parent Dashboard</h2>
        <Button onClick={() => router.push('/dashboard/parent/children/add')}>
          Add Child
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <FiUsers className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Children</p>
              <h3 className="text-2xl font-bold">{mockData.children.length}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-full">
              <FiBook className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Classes</p>
              <h3 className="text-2xl font-bold">
                {mockData.children.reduce((total, child) => total + child.courses.length, 0)}
              </h3>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <FiBell className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Notifications</p>
              <h3 className="text-2xl font-bold">3</h3>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-yellow-100 rounded-full">
              <FiTrendingUp className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Progress</p>
              <h3 className="text-2xl font-bold">
                {Math.round(
                  mockData.children.reduce((total, child) => {
                    const childAvg = child.courses.reduce((sum, course) => sum + course.progress, 0) / child.courses.length
                    return total + childAvg
                  }, 0) / mockData.children.length
                )}%
              </h3>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {mockData.children.map((child) => (
          <Card key={child.id} className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">{child.name}</h3>
                <span className="text-sm text-gray-500">{child.grade}</span>
              </div>
              
              <div className="space-y-4">
                {child.courses.map((course) => (
                  <div key={course.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">{course.title}</h4>
                      <span className="text-sm text-gray-500">{course.progress}%</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>{course.teacher}</span>
                      <div className="flex items-center">
                        <FiClock className="w-4 h-4 mr-1" />
                        <span>Next: {new Date(course.nextClass).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Events */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <FiBell className="w-5 h-5 text-purple-500" />
              <h2 className="text-xl font-semibold">Upcoming Events</h2>
            </div>
            <Button variant="outline" size="sm">View All</Button>
          </div>
          <div className="space-y-4">
            {mockData.upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{event.title}</h3>
                    <p className="text-sm text-gray-500">
                      {event.date} • {event.time}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    Add to Calendar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activities */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <FiClock className="w-5 h-5 text-green-500" />
              <h2 className="text-xl font-semibold">Recent Activities</h2>
            </div>
            <Button variant="outline" size="sm">View All</Button>
          </div>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <p className="font-medium">John completed Mathematics Quiz</p>
              <p className="text-sm text-gray-500">2 hours ago</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="font-medium">Jane submitted Physics Assignment</p>
              <p className="text-sm text-gray-500">5 hours ago</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
    {/* </div> */}
    </DashboardLayout>
  )
}
