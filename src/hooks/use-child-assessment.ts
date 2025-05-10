import { useState, useEffect, useCallback } from 'react'

interface ChildAssessment {
  _id: string
  type: 'parent_questionnaire'
  childId: string
  parentId: string
  responses: Array<{
    category: string
    questions: Array<{
      questionId: string
      question: string
      answer: string
      notes: string
    }>
  }>
  familyBackground: {
    primaryLanguage: string
    otherLanguages: string[]
    learningEnvironment: string
  }
  challengeAreas: string[]
  goals: string[]
  status: 'pending' | 'assigned' | 'completed'
  adminReview: {
    reviewedBy?: string
    reviewedAt?: string
    notes?: string
    recommendedTeachers?: string[]
  }
  createdAt: string
  updatedAt: string
}

export function useChildAssessment(childId: string) {
  const [assessment, setAssessment] = useState<ChildAssessment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAssessment = async () => {
      if (!childId) {
        console.log('No childId provided')
        return
      }

      try {
        setLoading(true)
        console.log('Fetching child assessment for:', childId)
        
        const res = await fetch(`/api/students/${childId}/child-assessment`)
        console.log('Response status:', res.status)
        
        const data = await res.json()
        console.log('Full response data:', data)
        
        if (data.debug) {
          console.log('Debug info:', data.debug)
        }
        
        setAssessment(data.assessment)
        
        if (!data.assessment) {
          console.warn('No assessment found. Debug info:', data.debug)
        }
      } catch (err) {
        console.error('Error fetching child assessment:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAssessment()
  }, [childId])

  // Add a refetch function
  const refetch = useCallback(async () => {
    if (!childId) return

    try {
      setLoading(true)
      const res = await fetch(`/api/students/${childId}/child-assessment`)
      if (!res.ok) throw new Error('Failed to fetch child assessment')
      const data = await res.json()
      setAssessment(data.assessment)
    } catch (err) {
      console.error('Error refetching child assessment:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [childId])

  return { assessment, loading, error, refetch }
}
