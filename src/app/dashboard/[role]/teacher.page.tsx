"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FiUsers, FiBook, FiCalendar, FiBell, FiClock } from "react-icons/fi"
import { useRouter } from "next/navigation"

export default function TeacherDashboard() {
  const router = useRouter()
  // This would be fetched from the database in a real application
  const mockData = {
    classes: [
      { id: 1, name: "Mathematics 101", students: 25, time: "9:00 AM" },
      { id: 2, name: "Advanced Algebra", students: 18, time: "11:00 AM" },
    ],
    recentSubmissions: [
      { id: 1, student: "John Doe", assignment: "Math Quiz 1", status: "Pending" },
      { id: 2, student: "Jane Smith", assignment: "Homework 2", status: "Graded" },
    ],
  }

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid gap-6 mb-8 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <FiUsers className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <h3 className="text-2xl font-bold">43</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-full">
              <FiBook className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Active Classes</p>
              <h3 className="text-2xl font-bold">2</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <FiBell className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
              <h3 className="text-2xl font-bold">5</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Today's Schedule */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Today's Schedule</h2>
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/teacher/schedule')}
          >
            View All
          </Button>
        </div>
        <div className="grid gap-4">
          {mockData.classes.map((classItem) => (
            <Card key={classItem.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <FiClock className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">{classItem.name}</h3>
                    <p className="text-sm text-gray-600">
                      {classItem.students} students • {classItem.time}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Join Class
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Submissions */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Submissions</h2>
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/teacher/assignments')}
          >
            View All
          </Button>
        </div>
        <div className="grid gap-4">
          {mockData.recentSubmissions.map((submission) => (
            <Card key={submission.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{submission.student}</h3>
                  <p className="text-sm text-gray-600">{submission.assignment}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    submission.status === "Pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {submission.status}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
