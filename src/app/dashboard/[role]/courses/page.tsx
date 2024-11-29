"use client"

import { Button } from "@/components/ui/button"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FiBook, FiCalendar, FiClock, FiFilter, FiSearch, FiUser, FiMessageSquare } from "react-icons/fi"
import { useRouter } from "next/navigation"
import { useThemeContext } from "@/hooks/use-theme-context"

// Mock data - would come from API in real app
const standardCourses = [
  {
    id: 1,
    title: "Quranic Reading & Tajweed",
    teacher: "Ustadh Ahmad",
    level: "Beginner",
    schedule: "Mon, Wed, Fri",
    time: "14:00 - 15:30",
    progress: 75,
    nextClass: "2024-02-20 14:00",
    description: "Master Quran reading with proper tajweed rules",
    capacity: "5 students",
    duration: "4 months",
    prerequisites: "Basic Arabic alphabet knowledge"
  },
  {
    id: 2,
    title: "Classical Arabic Grammar",
    teacher: "Ustadha Sarah",
    level: "Intermediate",
    schedule: "Tue, Thu",
    time: "10:00 - 11:30",
    progress: 82,
    nextClass: "2024-02-21 10:00",
    description: "Comprehensive study of Arabic grammar rules",
    capacity: "8 students",
    duration: "6 months",
    prerequisites: "Basic Arabic reading and writing"
  }
]

const activeRequests = [
  {
    id: 1,
    subject: "One-on-One Quran Memorization",
    status: "Matching Teacher",
    preferences: {
      schedule: "Weekends",
      level: "Advanced",
      focus: "Memorization",
      language: "English/Arabic"
    },
    submittedAt: "2024-02-15"
  }
]

export default function CoursesPage() {
  const router = useRouter()
  const { theme } = useThemeContext()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className={`text-3xl font-bold ${theme.text.light}`}>Islamic Studies Program</h2>
          <div className="space-x-4">
            <Button 
              variant="outline"
              onClick={() => router.push('/dashboard/parent/courses/request')}
              className={theme.button.outline}
            >
              Request Custom Learning
            </Button>
            <Button 
              onClick={() => router.push('/dashboard/parent/courses/enroll')}
              className={theme.button.primary}
            >
              Enroll in Course
            </Button>
          </div>
        </div>

        <Tabs defaultValue="courses" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="courses" className={`flex-1 ${theme.text.light}`}>Standard Courses</TabsTrigger>
            <TabsTrigger value="requests" className={`flex-1 ${theme.text.light}`}>Learning Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <Input
                    placeholder="Search courses..."
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" className={theme.button.outline}>
                  <FiFilter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {standardCourses.map((course) => (
                <Card key={course.id} className={`p-6 hover:shadow-md transition-shadow ${theme.background.light}`}>
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className={`text-xl font-bold ${theme.text.light}`}>{course.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <FiUser className="w-4 h-4" />
                          <span>{course.teacher}</span>
                          <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                            {course.level}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/dashboard/parent/courses/${course.id}`)}
                        className={theme.button.outline}
                      >
                        View Details
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <FiCalendar className="w-4 h-4" />
                        <span>{course.schedule}</span>
                        <span>•</span>
                        <FiClock className="w-4 h-4" />
                        <span>{course.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <FiBook className="w-4 h-4" />
                        <span>{course.duration}</span>
                        <span>•</span>
                        <span>{course.capacity}</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600">{course.description}</p>
                    
                    <div className="text-sm">
                      <span className="font-medium">Prerequisites: </span>
                      <span className="text-gray-600">{course.prerequisites}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-emerald-800">
              <p>
                Request custom learning plans tailored to your needs. Our team will match you with qualified teachers.
              </p>
            </div>

            <div className="grid gap-6">
              {activeRequests.map((request) => (
                <Card key={request.id} className={`p-6 hover:shadow-md transition-shadow ${theme.background.light}`}>
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className={`text-xl font-bold ${theme.text.light}`}>{request.subject}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                            {request.status}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className={theme.button.outline}
                      >
                        <FiMessageSquare className="w-4 h-4" />
                        Contact Support
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-medium mb-2">Preferences</h4>
                        <ul className="space-y-1 text-gray-600">
                          <li>Schedule: {request.preferences.schedule}</li>
                          <li>Level: {request.preferences.level}</li>
                          <li>Focus: {request.preferences.focus}</li>
                          <li>Language: {request.preferences.language}</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Request Details</h4>
                        <div className="text-gray-600">
                          Submitted: {request.submittedAt}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
