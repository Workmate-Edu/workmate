"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { FiPlus, FiBook, FiUser, FiCalendar } from "react-icons/fi"
import { useToast } from "@/components/ui/use-toast"

interface Child {
  id: string
  name: string
  grade: string
  studentId: string
  schoolName: string
  subjects: Array<{
    name: string
    progress: number
  }>
}

export default function ChildrenPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const response = await fetch('/api/parent/children')
        if (!response.ok) {
          throw new Error('Failed to fetch children')
        }
        const data = await response.json()
        setChildren(data.children)
      } catch (error) {
        console.error('Error fetching children:', error)
        toast({
          title: "Error",
          description: "Failed to load children. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchChildren()
  }, [toast])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">My Children</h2>
        <Button onClick={() => router.push('/dashboard/parent/children/add')}>
          <FiPlus className="mr-2 h-4 w-4" /> Add Child
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : children.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold">No Children Added Yet</h3>
              <p className="text-sm text-gray-500">
                Click the "Add Child" button above to get started.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {children.map((child) => (
            <Card key={child.id}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FiUser className="h-5 w-5" />
                  <span>{child.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <FiCalendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{child.grade}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiBook className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{child.schoolName}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Subjects</h4>
                    <div className="space-y-2">
                      {child.subjects.map((subject) => (
                        <div key={subject.name} className="flex justify-between text-sm">
                          <span>{subject.name}</span>
                          <span>{subject.progress}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
