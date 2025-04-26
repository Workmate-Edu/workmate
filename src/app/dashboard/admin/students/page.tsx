"use client"

import { useEffect, useState } from "react"
import { StudentTabs } from "@/components/admin/student-tabs"
import { toast } from "sonner"

export default function StudentsPage() {
  const [students, setStudents] = useState({ independent: [], children: [] })
  const [loading, setLoading] = useState(true)

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/students')
      if (!response.ok) throw new Error('Failed to fetch students')
      const data = await response.json()
      setStudents(data)
    } catch (error) {
      console.error('Error fetching students:', error)
      toast.error('Failed to load students')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-8">Students</h1>
      <StudentTabs 
        independent={students.independent} 
        children={students.children}
        isLoading={loading}
        showFilters={true}
      />
    </div>
  )
}
