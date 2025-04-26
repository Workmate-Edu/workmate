"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MessageSquare, Book, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { PageHeader } from "@/components/layouts/page-header"

interface StudentInfo {
  id: string
  name: string
  subject: string
  assessmentStatus: string
  nextSession?: {
    date: string
    time: string
  }
}

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<StudentInfo[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch('/api/teacher/assigned-students')
        if (!res.ok) throw new Error('Failed to fetch students')
        const data = await res.json()
        setStudents(data)
      } catch (error) {
        toast.error("Failed to load students")
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [])

  if (loading) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">My Students</h1>
        <Card className="p-6">
          <div className="h-24 animate-pulse bg-muted rounded-lg" />
        </Card>
      </div>
    )
  }

  return (
    <PageHeader>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Students</h1>
          <p className="text-muted-foreground">View and manage your students</p>
        </div>
      </div>
      <div className="container py-8">
        {students.length === 0 ? (
          <Card className="p-6">
            <div className="text-center space-y-4">
              <Users className="w-12 h-12 text-muted-foreground mx-auto" />
              <h2 className="text-xl font-semibold">No Students Yet</h2>
              <p className="text-muted-foreground">
                Students will appear here once they are assigned to you
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {students.map((student) => (
              <Card key={student.id} className="p-6">
                <div className="flex flex-col h-full">
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold">{student.name}</h2>
                    <Badge className="mt-2">{student.subject}</Badge>
                  </div>

                  {student.nextSession && (
                    <div className="text-sm text-muted-foreground mb-4">
                      <p className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Next Class: {student.nextSession.date}
                      </p>
                      <p className="mt-1">{student.nextSession.time}</p>
                    </div>
                  )}

                  <div className="flex gap-2 mt-auto">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push(`/dashboard/teacher/messages?student=${student.id}`)}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => router.push(`/dashboard/teacher/students/${student.id}`)}
                    >
                      <Book className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageHeader>
  )
}
