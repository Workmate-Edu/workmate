"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FiUsers,
  FiTrendingUp,
  FiCalendar,
  FiBook,
  FiDownload,
  FiFilter,
} from "react-icons/fi"
import { useRouter } from "next/navigation"

// Mock data - replace with actual API calls
const mockData = {
  overallStats: {
    totalStudents: 145,
    averageAttendance: 92,
    averagePerformance: 85,
    activeClasses: 6,
  },
  performanceTrends: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    data: [75, 78, 82, 79, 85, 88],
  },
  subjectPerformance: [
    { subject: "Mathematics", performance: 88 },
    { subject: "Physics", performance: 82 },
    { subject: "Chemistry", performance: 85 },
    { subject: "Biology", performance: 90 },
  ],
  studentEngagement: {
    highlyEngaged: 45,
    moderatelyEngaged: 35,
    lowEngagement: 20,
  },
  classAttendance: [
    { class: "Mathematics 101", attendance: 95 },
    { class: "Advanced Algebra", attendance: 88 },
    { class: "Physics Fundamentals", attendance: 92 },
    { class: "Chemistry Lab", attendance: 86 },
  ],
}

export default function TeacherAnalyticsPage() {
  const router = useRouter()

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return "text-green-600"
    if (performance >= 80) return "text-blue-600"
    if (performance >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
            <p className="text-muted-foreground">
              Track student performance and engagement metrics
            </p>
          </div>
          <div className="flex space-x-2">
            <Select defaultValue="thisMonth">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="thisWeek">This Week</SelectItem>
                <SelectItem value="thisMonth">This Month</SelectItem>
                <SelectItem value="lastMonth">Last Month</SelectItem>
                <SelectItem value="thisYear">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <FiDownload className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <FiUsers className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <h3 className="text-2xl font-bold">{mockData.overallStats.totalStudents}</h3>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-full">
                <FiTrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Performance</p>
                <h3 className="text-2xl font-bold">{mockData.overallStats.averagePerformance}%</h3>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <FiCalendar className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                <h3 className="text-2xl font-bold">{mockData.overallStats.averageAttendance}%</h3>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <FiBook className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Classes</p>
                <h3 className="text-2xl font-bold">{mockData.overallStats.activeClasses}</h3>
              </div>
            </div>
          </Card>
        </div>

        {/* Performance by Subject */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Performance by Subject</h3>
            <div className="space-y-4">
              {mockData.subjectPerformance.map((subject) => (
                <div key={subject.subject} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{subject.subject}</span>
                    <span className={`text-sm font-medium ${getPerformanceColor(subject.performance)}`}>
                      {subject.performance}%
                    </span>
                  </div>
                  <Progress value={subject.performance} className="h-2" />
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Class Attendance</h3>
            <div className="space-y-4">
              {mockData.classAttendance.map((classItem) => (
                <div key={classItem.class} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{classItem.class}</span>
                    <span className={`text-sm font-medium ${getPerformanceColor(classItem.attendance)}`}>
                      {classItem.attendance}%
                    </span>
                  </div>
                  <Progress value={classItem.attendance} className="h-2" />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Student Engagement Distribution */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Student Engagement Distribution</h3>
            <Button variant="outline">
              <FiFilter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="text-sm font-medium text-green-600">Highly Engaged</h4>
              <p className="text-2xl font-bold text-green-700">{mockData.studentEngagement.highlyEngaged}%</p>
              <p className="text-sm text-green-600 mt-1">
                {Math.round((mockData.studentEngagement.highlyEngaged * mockData.overallStats.totalStudents) / 100)} students
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="text-sm font-medium text-yellow-600">Moderately Engaged</h4>
              <p className="text-2xl font-bold text-yellow-700">{mockData.studentEngagement.moderatelyEngaged}%</p>
              <p className="text-sm text-yellow-600 mt-1">
                {Math.round((mockData.studentEngagement.moderatelyEngaged * mockData.overallStats.totalStudents) / 100)} students
              </p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <h4 className="text-sm font-medium text-red-600">Low Engagement</h4>
              <p className="text-2xl font-bold text-red-700">{mockData.studentEngagement.lowEngagement}%</p>
              <p className="text-sm text-red-600 mt-1">
                {Math.round((mockData.studentEngagement.lowEngagement * mockData.overallStats.totalStudents) / 100)} students
              </p>
            </div>
          </div>
        </Card>

        {/* Performance Trends */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Performance Trends</h3>
            <div className="flex space-x-2">
              <Select defaultValue="6months">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="1year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            Chart Component Here
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
