"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface Student {
  _id: string
  name: string
  email: string
  createdAt: string // Add this field
  studentProfile: {
    grade?: string
    learningPreferences?: {
      preferredLanguage: string
      studySchedule: string
      learningStyle: string[]
    }
    teachers: Array<{
      teacherId: string
      name: string
      subjects: string[]
      status: string
    }>
    parent?: {
      name: string
      phone: string
    }
    assessmentStatus?: string
  }
}

export function StudentList({ type }: { type: 'independent' | 'children' }) {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStudents()
  }, [type])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/students?type=${type}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch students')
      }
      
      setStudents(data.students || [])
    } catch (error) {
      console.error('Failed to fetch students:', error)
      toast.error("Failed to load students")
      setStudents([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!students.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No {type} students found
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {students.map((student) => (
        <Card key={student._id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarFallback>{student.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{student.name}</h3>
                  <p className="text-sm text-muted-foreground">{student.email}</p>
                  {type === 'children' && student.studentProfile?.parent && (
                    <div className="text-sm text-muted-foreground">
                      <p>Parent: {student.studentProfile.parent.name}</p>
                      <p>Contact: {student.studentProfile.parent.phone}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2 text-right">
                {student.studentProfile?.grade && (
                  <Badge>Grade {student.studentProfile.grade}</Badge>
                )}
                {student.studentProfile?.assessmentStatus && (
                  <Badge variant={
                    student.studentProfile.assessmentStatus === 'completed' ? 'success' :
                    student.studentProfile.assessmentStatus === 'pending' ? 'warning' : 'default'
                  }>
                    {student.studentProfile.assessmentStatus}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Learning Preferences */}
              {student.studentProfile?.learningPreferences && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Learning Preferences</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Language:</p>
                      <p className="text-sm">{student.studentProfile.learningPreferences.preferredLanguage}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Schedule:</p>
                      <p className="text-sm">{student.studentProfile.learningPreferences.studySchedule}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground">Learning Style:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {student.studentProfile.learningPreferences.learningStyle.map((style, i) => (
                        <Badge key={i} variant="outline">{style}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Assigned Teachers */}
              {student.studentProfile?.teachers?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Assigned Teachers</h4>
                  <div className="space-y-2">
                    {student.studentProfile.teachers.map((teacher, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <div>
                          <p className="text-sm">{teacher.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {teacher.subjects.join(", ")}
                          </p>
                        </div>
                        <Badge variant={
                          teacher.status === 'active' ? 'success' :
                          teacher.status === 'pending' ? 'warning' : 'secondary'
                        }>
                          {teacher.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Update Registration Date to use createdAt */}
              <p className="text-xs text-muted-foreground pt-4">
                Registered: {new Date(student.createdAt).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
