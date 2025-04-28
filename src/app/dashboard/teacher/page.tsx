"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/layouts/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Users, BookOpen, Star, Clock, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface Student {
  id: string
  name: string
  grade: string
  subjects: Array<{
    name: string
    progress: number
  }>
}

export default function TeacherDashboard() {
  const [assignedStudents, setAssignedStudents] = useState<Student[]>([])
  const [stats, setStats] = useState<{
    totalStudents: number
    activeClasses: number
    completedSessions: number
    teachingHours: number
    averageRating: number
    upcomingSessions: number
    subjects: Array<{}>
    assignedStudents?: Student[]
  }>({
    totalStudents: 0,
    activeClasses: 0,
    completedSessions: 0,
    teachingHours: 0,
    averageRating: 0,
    upcomingSessions: 0,
    subjects: [],
    assignedStudents: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTeacherStats()
    fetchAssignedStudents()
  }, [])

  const fetchTeacherStats = async () => {
    try {
      const response = await fetch('/api/teacher/stats')
      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      setStats({
        ...data,
        // If assignedStudents is included in the stats API, use it:
        assignedStudents: Array.isArray(data.assignedStudents) ? data.assignedStudents : undefined
      })
      // Optionally, if assignedStudents is included, setAssignedStudents here:
      if (Array.isArray(data.assignedStudents)) {
        setAssignedStudents(data.assignedStudents)
      }
    } catch (error) {
      toast.error("Failed to load dashboard stats")
    }
  }

  const fetchAssignedStudents = async () => {
    try {
      const response = await fetch('/api/teacher/students')
      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      setAssignedStudents(data)
    } catch (error) {
      toast.error("Failed to load assigned students")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <PageHeader>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
          <p className="text-muted-foreground">Overview of your teaching activities</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mt-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center justify-center rounded-lg bg-blue-50 p-2">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Students</p>
              <p className="text-2xl font-bold">{stats?.totalStudents || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center justify-center rounded-lg bg-emerald-50 p-2">
              <GraduationCap className="h-6 w-6 text-emerald-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Assigned Students</p>
              <p className="text-2xl font-bold">
                {/* Prefer stats.assignedStudents if available, else fallback to assignedStudents.length */}
                {Array.isArray(stats?.assignedStudents)
                  ? stats.assignedStudents.length
                  : assignedStudents.length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center justify-center rounded-lg bg-yellow-50 p-2">
              <Star className="h-6 w-6 text-yellow-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
              <p className="text-2xl font-bold">{stats?.averageRating || '0.0'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center justify-center rounded-lg bg-green-50 p-2">
              <BookOpen className="h-6 w-6 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Active Classes</p>
              <p className="text-2xl font-bold">{stats?.activeClasses || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center justify-center rounded-lg bg-purple-50 p-2">
              <Clock className="h-6 w-6 text-purple-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Completed Lessons</p>
              <p className="text-2xl font-bold">{stats?.completedSessions || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Assigned Students</h3>
              <GraduationCap className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              {assignedStudents.map(student => (
                <div key={student.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-muted-foreground">Grade: {student.grade || 'N/A'}</p>
                  </div>
                  <div className="flex gap-2">
                    {(Array.isArray(student.subjects) ? student.subjects : []).map((subject) => (
                      <Badge key={subject.name} variant="outline">
                        {subject.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageHeader>
  )
}
