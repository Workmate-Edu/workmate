"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Users } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { PageHeader } from "@/components/layouts/page-header"

interface Subject {
  id: string
  name: string
  area: string
  studentCount: number
  students: Array<{
    id: string
    name: string
  }>
}

interface CourseArea {
  area: string
  subjects: Subject[]
}

export default function CoursesPage() {
  const [areas, setAreas] = useState<CourseArea[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/teacher/courses')
      if (!response.ok) throw new Error('Failed to fetch courses')
      const data = await response.json()
      setAreas(data)
    } catch (error) {
      console.error('Failed to fetch courses:', error)
      toast.error("Failed to load courses")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <PageHeader>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Courses</h1>
          <p className="text-muted-foreground">Manage your teaching subjects</p>
        </div>
      </div>

      {areas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-48 space-y-4">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">No active courses yet</p>
            <p className="text-sm text-muted-foreground text-center">
              You will see courses here once students are assigned to your subjects
            </p>
          </CardContent>
        </Card>
      ) : (
        areas.map(area => (
          <Card key={area.area} className="p-6">
            <CardTitle className="mb-4 capitalize">
              {area.area} Courses
            </CardTitle>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {area.subjects.map(subject => (
                <Card key={subject.id}>
                  <CardHeader>
                    <CardTitle className="capitalize">{subject.name}</CardTitle>
                    <CardDescription>{area.area}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>{subject.studentCount} Students</span>
                      </div>
                      <Badge>Active</Badge>
                    </div>
                    <Button asChild className="w-full">
                      <Link href={`/dashboard/teacher/courses/${subject.id}`}>
                        View Course
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Card>
        ))
      )}
    </PageHeader>
  )
}
