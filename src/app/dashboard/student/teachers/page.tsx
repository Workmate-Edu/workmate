"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { MessageCircle, Star } from "lucide-react"

interface SubjectArea {
  area: string
  subjects: string[]
}

interface Qualification {
  degree: string
  institution: string
  year: number
  _id: string
}

interface Teacher {
  id: string
  name: string
  email: string
  phone: string
  bio: string
  language: string
  subjects: SubjectArea[]
  qualifications: Qualification[]
  averageRating: number
  reviewCount: number
}

interface StudentProfile {
  registeredAs: "independent" | "child"
}

export default function TeachersPage() {
  const { data: session } = useSession()
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null)

  useEffect(() => {
    Promise.all([loadTeachers(), loadProfile()])
  }, [])

  async function loadProfile() {
    try {
      const res = await fetch("/api/student/profile")
      if (!res.ok) throw new Error()
      const { studentProfile } = await res.json()
      setStudentProfile(studentProfile)
    } catch {
      setStudentProfile(null)
    }
  }

  async function loadTeachers() {
    setError(false)
    try {
      const res = await fetch("/api/student/teachers")
      if (!res.ok) throw new Error()
      setTeachers(await res.json())
    } catch {
      toast.error("Failed to load teachers")
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <div className="container py-16 text-center space-y-6">
        <p className="text-xl font-semibold">Something Went Wrong</p>
        <p className="text-muted-foreground">
          We’re experiencing technical difficulties. Please try again or return home.
        </p>
        <div className="flex justify-center gap-4">
          <Button onClick={loadTeachers}>Try Again</Button>
          <Link href="/">
            <Button variant="outline">Go to Homepage</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container py-16 flex justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  const canMessage = studentProfile?.registeredAs === "independent"

  return (
    <div className="container py-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold">My Teachers</h1>
        <p className="text-muted-foreground">Connect with your assigned teachers</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {teachers.map((t) => (
          <Card key={t.id} className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{t.name}</h2>
              {t.reviewCount > 0 && (
                <div className="flex items-center gap-1 text-sm text-yellow-500">
                  <Star className="w-4 h-4" />
                  {t.averageRating.toFixed(1)}{" "}
                  <span className="text-muted-foreground">({t.reviewCount})</span>
                </div>
              )}
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2">{t.bio}</p>

            <div className="flex flex-wrap gap-2">
              {t.subjects.flatMap((g) =>
                g.subjects.map((s) => (
                  <Badge key={`${g.area}:${s}`} variant="secondary">
                    {s}
                  </Badge>
                ))
              )}
            </div>

            {canMessage ? (
              <Link
                href={`/dashboard/student/messages?teacherId=${t.id}`}
                className="block"
              >
                <Button className="w-full">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message Teacher
                </Button>
              </Link>
            ) : (
              <Button
                variant="secondary"
                className="w-full"
                disabled
                title="Parents must message on behalf of child students"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Parent Contact Required
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
