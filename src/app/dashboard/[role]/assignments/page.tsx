"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FiClock, FiCheck, FiAlertCircle, FiCalendar } from "react-icons/fi"
import { Progress } from "@/components/ui/progress"

export default function StudentAssignmentsPage() {
  const mockAssignments = [
    {
      id: 1,
      subject: "Mathematics",
      title: "Advanced Algebra Quiz",
      dueDate: "2024-02-25",
      status: "pending",
      progress: 0,
      teacher: "Dr. Johnson",
    },
    {
      id: 2,
      subject: "Physics",
      title: "Lab Report: Forces and Motion",
      dueDate: "2024-02-23",
      status: "in-progress",
      progress: 60,
      teacher: "Ms. Thompson",
    },
    {
      id: 3,
      subject: "English Literature",
      title: "Essay: Shakespeare Analysis",
      dueDate: "2024-02-22",
      status: "completed",
      progress: 100,
      teacher: "Mr. Williams",
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <FiClock className="w-5 h-5 text-yellow-500" />
      case "in-progress":
        return <FiCalendar className="w-5 h-5 text-blue-500" />
      case "completed":
        return <FiCheck className="w-5 h-5 text-green-500" />
      default:
        return <FiAlertCircle className="w-5 h-5 text-red-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700"
      case "in-progress":
        return "bg-blue-100 text-blue-700"
      case "completed":
        return "bg-green-100 text-green-700"
      default:
        return "bg-red-100 text-red-700"
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight">My Assignments</h2>
          <div className="space-x-2">
            <Button variant="outline">
              Calendar View
            </Button>
            <Button variant="outline">
              Filter
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Due Soon</h3>
                <FiClock className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold">5</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">In Progress</h3>
                <FiCalendar className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold">3</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Completed</h3>
                <FiCheck className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold">12</p>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {mockAssignments.map((assignment) => (
              <Card key={assignment.id} className="p-4">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-500">
                          {assignment.subject}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(assignment.status)}`}>
                          {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold">{assignment.title}</h3>
                      <p className="text-sm text-gray-500">
                        Teacher: {assignment.teacher}
                      </p>
                    </div>
                    {getStatusIcon(assignment.status)}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{assignment.progress}%</span>
                    </div>
                    <Progress value={assignment.progress} className="h-2" />
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </p>
                    <Button>
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
