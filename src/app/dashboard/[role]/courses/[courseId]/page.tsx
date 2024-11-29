"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useParams } from "next/navigation"
import {
  FiBook,
  FiCalendar,
  FiClock,
  FiUser,
  FiFileText,
  FiVideo,
  FiCheckCircle,
} from "react-icons/fi"

export default function CoursePage() {
  const params = useParams()
  const role = params.role as "student" | "teacher" | "parent"
  const courseId = params.courseId as string

  // Mock data - would come from API in real app
  const mockCourseDetails = {
    id: parseInt(courseId),
    title: "Advanced Mathematics",
    subject: "Mathematics",
    teacher: "Dr. Sarah Johnson",
    progress: 65,
    nextClass: "2024-02-20 14:00",
    description: "Advanced calculus and linear algebra concepts for high school students.",
    schedule: [
      { day: "Monday", time: "14:00 - 15:30" },
      { day: "Wednesday", time: "14:00 - 15:30" },
    ],
    materials: [
      { id: 1, title: "Week 1: Introduction to Calculus", type: "pdf" },
      { id: 2, title: "Week 2: Derivatives", type: "pdf" },
      { id: 3, title: "Calculus Basics", type: "video" },
    ],
    assignments: [
      {
        id: 1,
        title: "Calculus Assignment 1",
        dueDate: "2024-02-25",
        status: "completed",
        grade: "A",
      },
      {
        id: 2,
        title: "Linear Algebra Quiz",
        dueDate: "2024-03-01",
        status: "pending",
      },
    ],
    studentName: role === "parent" ? "John Doe Jr." : undefined,
    attendance: role === "parent" ? [
      { date: "2024-02-13", status: "present" },
      { date: "2024-02-15", status: "absent" },
      { date: "2024-02-18", status: "present" },
    ] : undefined,
    students: role === "teacher" ? [
      { id: 1, name: "John Doe", progress: 75 },
      { id: 2, name: "Jane Smith", progress: 60 },
      { id: 3, name: "Mike Johnson", progress: 85 },
    ] : undefined,
  }

  const renderSchedule = () => (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <FiCalendar className="mr-2" />
        Schedule
      </h2>
      <div className="space-y-4">
        {mockCourseDetails.schedule?.map((slot, index) => (
          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="font-medium">{slot.day}</span>
            <span className="text-gray-600">{slot.time}</span>
          </div>
        ))}
      </div>
    </Card>
  )

  const renderMaterials = () => (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <FiFileText className="mr-2" />
        Course Materials
      </h2>
      <div className="space-y-4">
        {mockCourseDetails.materials?.map((material) => (
          <div key={material.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              {material.type === "pdf" ? (
                <FiFileText className="mr-2 text-red-500" />
              ) : (
                <FiVideo className="mr-2 text-blue-500" />
              )}
              <span>{material.title}</span>
            </div>
            <Button variant="outline" size="sm">
              View
            </Button>
          </div>
        ))}
      </div>
    </Card>
  )

  const renderAssignments = () => (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <FiBook className="mr-2" />
        Assignments
      </h2>
      <div className="space-y-4">
        {mockCourseDetails.assignments?.map((assignment) => (
          <div key={assignment.id} className="p-4 border rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{assignment.title}</h3>
                <p className="text-sm text-gray-500">Due: {assignment.dueDate}</p>
              </div>
              <div className="flex items-center">
                {assignment.status === "completed" ? (
                  <span className="text-green-500 flex items-center">
                    <FiCheckCircle className="mr-1" />
                    {assignment.grade}
                  </span>
                ) : (
                  <span className="text-yellow-500">Pending</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )

  const renderTeacherStudentList = () => (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <FiUser className="mr-2" />
        Enrolled Students
      </h2>
      <div className="space-y-4">
        {mockCourseDetails.students?.map((student) => (
          <div key={student.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span>{student.name}</span>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <span className="mr-2">Progress:</span>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${student.progress}%` }}
                  />
                </div>
              </div>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )

  const renderParentProgress = () => (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <FiUser className="mr-2" />
        Student Progress
      </h2>
      <div className="space-y-6">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Overall Progress</span>
            <span>{mockCourseDetails.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${mockCourseDetails.progress}%` }}
            />
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="font-medium">Recent Attendance</h3>
          {mockCourseDetails.attendance?.map((record, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span>{record.date}</span>
              <span
                className={
                  record.status === "present" ? "text-green-500" : "text-red-500"
                }
              >
                {record.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Course Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{mockCourseDetails.title}</h1>
            <p className="text-gray-500">{mockCourseDetails.subject}</p>
            {role === "parent" && mockCourseDetails.studentName && (
              <p className="text-blue-600 mt-1">Student: {mockCourseDetails.studentName}</p>
            )}
          </div>
          {role === "teacher" ? (
            <Button>Edit Course</Button>
          ) : (
            <div className="text-right">
              <p className="text-sm text-gray-500">Next Class</p>
              <p className="font-medium">{mockCourseDetails.nextClass}</p>
            </div>
          )}
        </div>

        {/* Course Description */}
        <Card className="p-6">
          <p className="text-gray-600">{mockCourseDetails.description}</p>
        </Card>

        {/* Role-specific content */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
            {renderSchedule()}
            {role === "teacher" ? renderTeacherStudentList() : renderMaterials()}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {role === "student" && renderAssignments()}
            {role === "teacher" && renderAssignments()}
            {role === "parent" && renderParentProgress()}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
