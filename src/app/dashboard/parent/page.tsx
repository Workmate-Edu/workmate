"use client"

import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { BookOpen, GraduationCap, Users, MessageSquare } from "lucide-react"
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

export default function ParentDashboardPage() {
  const { data: session } = useSession()
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchChildren = async () => {
      try {
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
          <Users className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Welcome back, {session?.user?.name}</h1>

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

              {/* Action Links */}
              <div className="grid grid-cols-2 gap-3">
                <Link href={`/dashboard/parent/children/${child.id}`}>
                  <Button variant="outline" className="w-full group-hover:border-primary/50 transition-colors">
                    <GraduationCap className="mr-2 h-4 w-4" />
                    View Progress
                  </Button>
                </Link>
                <Link href={`/dashboard/parent/messages`}>
                  <Button variant="outline" className="w-full group-hover:border-primary/50 transition-colors">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message Teachers
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {children.length === 0 && !loading && (
        <Card className="p-6 text-center">
          <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">No Children Registered</h3>
          <p className="text-muted-foreground mt-1">Your registered children will appear here</p>
        </Card>
      )}
    </div>
  )
}
