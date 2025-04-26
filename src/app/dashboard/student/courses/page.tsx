"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { User, Book } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface Subject {
  id: string
  name: string
  area: string
  level: string
  teacher: {
    id: string
    name: string
    email: string
  }
  progress: number
  nextCall?: {
    date: string
    time: string
  }
}

interface CourseArea {
  area: string
  subjects: Subject[]
}

export default function StudentCoursesPage() {
  const [courseAreas, setCourseAreas] = useState<CourseArea[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await fetch('/api/student/courses')
        if (!response.ok) throw new Error('Failed to fetch courses')
        const data = await response.json()
        setCourseAreas(data)
      } catch (error) {
        console.error('Error fetching courses:', error)
        toast.error('Failed to load courses')
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  if (loading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">My Courses</h1>

      {courseAreas.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <Book className="h-12 w-12 text-muted-foreground" />
            <h2 className="text-xl font-semibold">No Courses Assigned</h2>
            <p className="text-muted-foreground">
              You haven't been assigned to any courses yet.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-8">
          {courseAreas.map((area) => (
            <div key={area.area}>
              <h2 className="text-2xl font-semibold mb-4 capitalize">{area.area}</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {area.subjects.map((subject) => (
                  <Card key={subject.id}>
                    <CardHeader>
                      <CardTitle className="capitalize">{subject.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start gap-2">
                          <User className="h-4 w-4 mt-1" />
                          <div>
                            <p className="font-medium">{subject.teacher.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {subject.teacher.email}
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {subject.area} - Level {subject.level}
                          </p>
                          {subject.nextCall && (
                            <Badge variant="secondary" className="mb-2">
                              Next Call: {subject.nextCall.date} at {subject.nextCall.time}
                            </Badge>
                          )}
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-muted-foreground">Progress</span>
                            <span className="text-sm font-medium">{subject.progress}%</span>
                          </div>
                          <Progress value={subject.progress} />
                        </div>

                        <Button asChild className="w-full">
                          <Link href={`/dashboard/student/courses/${subject.id}`}>
                            View Course
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}