"use client"

import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { Loader2, BookOpen, GraduationCap, Users } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface Child {
  id: string;
  name: string;
  email: string;
  grade?: string;
  subjects?: Array<{
    name: string;
    teacher?: {
      name: string;
    };
    progress?: number;
  }>;
}

export default function ParentChildrenPage() {
  const { data: session } = useSession()
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/parent/children')
        if (!res.ok) throw new Error('Failed to fetch children')
        const data = await res.json()
        setChildren(data.children || [])
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchChildren()
  }, [])

  if (loading) {
    return (
      <div className="container py-6">
        <div className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Children</h1>
        <p className="text-muted-foreground mt-2">
          Monitor your children's academic progress and activities
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {children.map((child) => (
          <Card key={child.id} className="relative overflow-hidden group hover:shadow-lg transition-shadow">
            {/* Top Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/50" />
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">{child.name}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{child.email}</p>
                </div>
                <Badge variant={child.grade ? "default" : "secondary"}>
                  {child.grade || 'No Grade'}
                </Badge>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="space-y-1">
                  <p className="text-sm font-medium flex items-center gap-1">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    Subjects
                  </p>
                  <p className="text-2xl font-bold">
                    {child.subjects?.length || 0}
                  </p>
                </div>
                {/* <div className="space-y-1">
                  <p className="text-sm font-medium flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    Teachers
                  </p>
                  <p className="text-2xl font-bold">
                    {child.subjects?.filter(s => s.teacher).length || 0}
                  </p>
                </div> */}
              </div>

              {/* Subjects List */}
              {child.subjects && child.subjects.length > 0 && (
                <div className="space-y-3 mb-6">
                  {child.subjects.map((subject, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <p className="font-medium">{subject.name}</p>
                        {subject.teacher && (
                          <p className="text-muted-foreground">{subject.teacher.name}</p>
                        )}
                      </div>
                      <Progress value={subject.progress || 0} className="h-1.5" />
                    </div>
                  ))}
                </div>
              )}

              {/* Action Button */}
              <Link 
                href={`/dashboard/parent/children/${child.id}`}
                className="w-full"
              >
                <Button 
                  variant="outline" 
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                >
                  View Details
                  <GraduationCap className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Card>
        ))}

        {children.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold">No Children Registered</h3>
            <p className="text-muted-foreground mt-1 max-w-sm">
              Once your children are registered, they will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
