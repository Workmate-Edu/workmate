// app/(dashboard)/parent/teachers/page.tsx
"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageCircle, Star, GraduationCap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import Link from "next/link"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface Subject {
  _id?: string
  name: string
  area: string
}

interface Teacher {
  id: string
  name: string
  bio: string
  subjects: Subject[]
  rating: number
  reviews: number
  qualifications: Array<{
    degree: string
    institution: string
    year: number
    _id: string
  }>
}

interface ParentProfile {
  interestedInLearning: boolean
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [parentProfile, setParentProfile] = useState<ParentProfile | null>(null)
  const [profileLoaded, setProfileLoaded] = useState(false)

  useEffect(() => {
    // kick off both in parallel
    fetchParentProfile()
    fetchTeachers()
  }, [])

  async function fetchParentProfile() {
    try {
      const res = await fetch("/api/parent/profile", { cache: "no-cache" })
      if (!res.ok) throw new Error("Failed to fetch profile")
      const data = await res.json()
      setParentProfile(data.parentProfile)
    } catch (err) {
      console.error(err)
    } finally {
      setProfileLoaded(true)
    }
  }

  async function fetchTeachers() {
    try {
      const res = await fetch("/api/parent/teachers")
      if (!res.ok) throw new Error("Failed to fetch teachers")
      const data = await res.json()
      setTeachers(data)
    } catch {
      toast.error("Failed to load teachers")
    } finally {
      setLoading(false)
    }
  }

  // only allow messaging if parent opted in to learn
  const canMessage = parentProfile?.interestedInLearning === true

  if (loading || !profileLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Teachers</h1>
        <p className="text-muted-foreground">
          {canMessage
            ? "Connect with your assigned teachers"
            : "Enable “Interested in Learning” in your profile to message teachers"}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {teachers.map((t) => (
          <Card key={t.id} className="p-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{t.name}</h3>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{t.rating}</span>
                    <span className="text-muted-foreground">({t.reviews})</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <GraduationCap className="w-4 h-4" />
                  <span>
                    {t.qualifications[0]?.degree ?? "No qualifications"}
                    {t.qualifications[0]?.institution
                      ? ` — ${t.qualifications[0].institution}`
                      : ""}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {t.bio}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {t.subjects.map((s, i) => (
                  <Badge key={s._id ?? i} variant="secondary">
                    {s.name}
                  </Badge>
                ))}
              </div>

              {canMessage ? (
                <Link
                  href={`/dashboard/student/messages?teacherId=${t.id}`}
                  className="block w-full"
                >
                  <Button className="w-full">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message Teacher
                  </Button>
                </Link>
              ) : (
                <Button
                  className="w-full"
                  variant="secondary"
                  disabled
                  title="Enable Interested in Learning to message teachers"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Parent Contact Required
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
