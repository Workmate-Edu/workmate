"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageCircle, Star, Clock, GraduationCap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import Link from "next/link"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface Subject {
  name: string;
  area: string;
  _id?: string;
}

interface Teacher {
  id: string
  name: string
  bio: string
  subjects: Subject[]
  rating: number
  reviews: number
  experience: string
  availability: string
  qualifications: Array<{
    degree: string
    institution: string
    year: number
    _id: string
  }>
}

interface StudentProfile {
  registeredAs: 'independent' | 'child';
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null)

  useEffect(() => {
    Promise.all([
      fetchTeachers(),
      fetchStudentProfile()
    ]);
  }, [])

  const fetchStudentProfile = async () => {
    try {
      const res = await fetch('/api/student/profile');
      if (!res.ok) throw new Error('Failed to fetch profile');
      const data = await res.json();
      setStudentProfile(data.studentProfile);
    } catch (error) {
      console.error('Error fetching student profile:', error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await fetch('/api/student/teachers')
      if (!response.ok) throw new Error('Failed to fetch teachers')
      const data = await response.json()
      setTeachers(data)
    } catch (error) {
      toast.error("Failed to load teachers")
    } finally {
      setLoading(false)
    }
  }

  const canMessageTeachers = studentProfile?.registeredAs === 'independent';

  if (loading) {
    return <div><LoadingSpinner /></div>
  }

  return (
    <div className="container py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Teachers</h1>
        <p className="text-muted-foreground">Connect with your assigned teachers</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {teachers.map((teacher) => (
          <Card key={teacher.id} className="p-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{teacher.name}</h3>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{teacher.rating}</span>
                    <span className="text-muted-foreground">
                      ({teacher.reviews} reviews)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <GraduationCap className="w-4 h-4" />
                  <span>
                    {teacher.qualifications?.[0]?.degree || 'No qualifications'}
                    {teacher.qualifications?.[0]?.institution && ` - ${teacher.qualifications[0].institution}`}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                {teacher?.bio}
              </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {teacher.subjects.map((subject, idx) => (
                  <Badge key={subject._id || idx} variant="secondary">
                    {subject.name}
                  </Badge>
                ))}
              </div>

              <div>
                {canMessageTeachers ? (
                  <Link href={`/dashboard/student/messages?teacherId=${teacher.id}`} className="w-full">
                    <Button className="w-full">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    className="w-full" 
                    variant="secondary" 
                    disabled
                    title="Only independent students can message teachers directly"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact through parent
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
