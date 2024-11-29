"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FiSearch, FiFilter, FiDownload, FiUsers } from "react-icons/fi"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

export default function TeacherStudentsPage() {
  const mockStudents = [
    {
      id: 1,
      name: "John Doe",
      grade: "10th Grade",
      attendance: 95,
      performance: 88,
      status: "active",
      email: "john.doe@school.com",
      parentName: "Robert Doe",
      lastActive: "2024-02-22T10:30:00",
    },
    {
      id: 2,
      name: "Jane Smith",
      grade: "10th Grade",
      attendance: 92,
      performance: 95,
      status: "active",
      email: "jane.smith@school.com",
      parentName: "Mary Smith",
      lastActive: "2024-02-22T09:15:00",
    },
    {
      id: 3,
      name: "Mike Johnson",
      grade: "10th Grade",
      attendance: 85,
      performance: 78,
      status: "attention",
      email: "mike.johnson@school.com",
      parentName: "Sarah Johnson",
      lastActive: "2024-02-21T14:20:00",
    },
  ]

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return "text-green-600"
    if (performance >= 80) return "text-blue-600"
    if (performance >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight">Students</h2>
          <div className="space-x-2">
            <Button variant="outline">
              <FiFilter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline">
              <FiDownload className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button>
              <FiUsers className="w-4 h-4 mr-2" />
              Add Student
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card className="p-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600">Total Students</h3>
              <p className="text-2xl font-bold">67</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600">Average Attendance</h3>
              <p className="text-2xl font-bold">92%</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600">Average Performance</h3>
              <p className="text-2xl font-bold">85%</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600">Needs Attention</h3>
              <p className="text-2xl font-bold">4</p>
            </div>
          </Card>
        </div>

        <div className="flex space-x-4 mb-6">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search students..."
              className="pl-10"
            />
          </div>
          <select className="px-4 py-2 border rounded-md">
            <option>All Grades</option>
            <option>10th Grade</option>
            <option>11th Grade</option>
            <option>12th Grade</option>
          </select>
        </div>

        <Card>
          <ScrollArea className="h-[600px]">
            <div className="p-4">
              <table className="w-full">
                <thead>
                  <tr className="text-sm text-gray-500">
                    <th className="text-left pb-4">Name</th>
                    <th className="text-left pb-4">Grade</th>
                    <th className="text-left pb-4">Attendance</th>
                    <th className="text-left pb-4">Performance</th>
                    <th className="text-left pb-4">Parent</th>
                    <th className="text-left pb-4">Last Active</th>
                    <th className="text-right pb-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockStudents.map((student) => (
                    <tr key={student.id} className="border-t">
                      <td className="py-4">
                        <div className="space-y-1">
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-gray-500">{student.email}</p>
                        </div>
                      </td>
                      <td className="py-4">{student.grade}</td>
                      <td className="py-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Progress value={student.attendance} className="w-24 h-2" />
                            <span className="text-sm font-medium">{student.attendance}%</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`font-medium ${getPerformanceColor(student.performance)}`}>
                          {student.performance}%
                        </span>
                      </td>
                      <td className="py-4">{student.parentName}</td>
                      <td className="py-4">
                        <span className="text-sm text-gray-500">
                          {new Date(student.lastActive).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <Button variant="outline" size="sm">View Profile</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollArea>
        </Card>
      </div>
    </DashboardLayout>
  )
}
