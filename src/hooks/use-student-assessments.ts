import { useState, useEffect } from 'react'

export function useStudentAssessments(studentId: string) {
  const [assessments, setAssessments] = useState<{
    initial: any[]
    child: any[]
  }>({ initial: [], child: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/admin/students/${studentId}/assessments`)
        if (!response.ok) throw new Error('Failed to fetch assessments')
        const data = await response.json()
        setAssessments(data.assessments)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load assessments')
      } finally {
        setLoading(false)
      }
    }

    if (studentId) {
      fetchAssessments()
    }
  }, [studentId])

  return { assessments, loading, error }
}
