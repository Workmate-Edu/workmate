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
  _id: string
  name: string
  email: string
  studentProfile?: {
    grade?: string
    registeredAs?: string
  }
}

const GRADE_COLORS: Record<string, string> = {
  "1": "bg-green-100 text-green-700",
  "2": "bg-blue-100 text-blue-700",
  "3": "bg-yellow-100 text-yellow-700",
  "4": "bg-purple-100 text-purple-700",
  "5": "bg-pink-100 text-pink-700",
  "6": "bg-orange-100 text-orange-700",
  "7": "bg-teal-100 text-teal-700",
  "8": "bg-red-100 text-red-700",
  "9": "bg-indigo-100 text-indigo-700",
  "10": "bg-cyan-100 text-cyan-700",
  "11": "bg-lime-100 text-lime-700",
  "12": "bg-fuchsia-100 text-fuchsia-700",
  "high_school": "bg-primary/10 text-primary",
  "independent": "bg-secondary/10 text-secondary",
  "child": "bg-muted text-muted-foreground"
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
      <div className="flex justify-between items-center mb-6">
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
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {students.map((student) => {
              const grade = student.studentProfile?.grade || "No grade set"
              const gradeColor = GRADE_COLORS[grade] || "bg-muted text-muted-foreground"
              const registeredAs = student.studentProfile?.registeredAs || ""
              return (
                <Card
                  key={student._id}
                  className="p-0 overflow-hidden shadow-lg border-2 border-primary/10 hover:border-primary/40 transition-all duration-200 bg-gradient-to-br from-primary/5 via-background to-secondary/5"
                >
                  <div className="flex flex-col h-full">
                    {/* Top Section */}
                    <div className="px-6 pt-6 pb-4 flex items-center gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                        {student.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-semibold truncate">{student.name}</h2>
                        <div className="flex gap-2 mt-1 flex-wrap capitalize">
                          <Badge className={gradeColor}>
                            {grade}
                          </Badge>
                          {registeredAs && (
                            <Badge variant="secondary" className="bg-secondary/10 text-secondary">
                              {registeredAs.charAt(0).toUpperCase() + registeredAs.slice(1)}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 truncate">
                          {student.email}
                        </div>
                      </div>
                    </div>
                    {/* Divider */}
                    <div className="border-t border-muted/40 mx-6" />
                    {/* Actions */}
                    <div className="flex gap-2 px-6 py-4 mt-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition"
                        onClick={() => router.push(`/dashboard/teacher/messages?student=${student._id}`)}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/20 transition"
                        onClick={() => router.push(`/dashboard/teacher/students/${student._id}`)}
                      >
                        <Book className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </PageHeader>
  )
}
