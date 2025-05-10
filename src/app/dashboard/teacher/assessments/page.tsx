"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Assessment } from "@/types/assessment"
import { useRouter } from "next/navigation"
import { FiPlus, FiCheck, FiClock, FiInbox, FiUser, FiCalendar, FiFile } from "react-icons/fi"

export default function AssessmentsPage() {
  const router = useRouter()
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchAssessments() {
      try {
        const response = await fetch('/api/assessments')
        if (!response.ok) {
          throw new Error('Failed to fetch assessments')
        }
        const data = await response.json()
        setAssessments(data)
      } catch (error) {
        console.error('Error fetching assessments:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAssessments()
  }, [])

  const getAssessmentStatusDisplay = (status: string) => {
    switch (status) {
      case 'draft':
        return {
          label: 'Draft',
          className: 'bg-yellow-100 text-yellow-800'
        }
      case 'active':
        return {
          label: 'Active',
          className: 'bg-blue-100 text-blue-700'
        }
      case 'submitted': // Changed from 'completed' to 'submitted'
        return {
          label: 'Submitted',
          className: 'bg-orange-100 text-orange-800'
        }
      case 'graded':
        return {
          label: 'Graded',
          className: 'bg-green-100 text-green-800'
        }
      default:
        return {
          label: status,
          className: 'bg-gray-100 text-gray-700'
        }
    }
  }

  const renderAssessmentItem = (assessment: Assessment) => {
    // Calculate total points from questions
    const totalPoints = assessment.questions?.reduce((sum, q) => sum + (q.points || 0), 0) || 0

    return (
      <Card key={assessment.id} className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{assessment.title}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${getAssessmentStatusDisplay(assessment.status).className}`}>
                  {getAssessmentStatusDisplay(assessment.status).label}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  assessment.type === 'quiz' 
                    ? 'bg-blue-100 text-blue-700'
                    : assessment.type === 'assignment'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {assessment.type}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{assessment.subject}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push(`/dashboard/teacher/assessments/${assessment.id}`)}
            >
              View Details
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FiCalendar className="w-4 h-4" />
              <span>Due: {new Date(assessment.dueDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FiUser className="w-4 h-4" />
              <span>{assessment.submissions?.length || 0} submissions</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FiFile className="w-4 h-4" />
              <span>{totalPoints} points</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Assessments</h1>
        <Button onClick={() => router.push('/dashboard/teacher/assessments/new')}>
          <FiPlus className="mr-2" /> Create Assessment
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <FiInbox className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm">Total</p>
              <h3 className="text-2xl font-bold">{assessments.length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <FiClock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm">Active</p>
              <h3 className="text-2xl font-bold">
                {assessments.filter(a => a.status === 'active').length}
              </h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-full">
              <FiUser className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm">Submitted</p>
              <h3 className="text-2xl font-bold">
                {assessments.filter(a => a.status === 'submitted').length}
              </h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full">
              <FiCheck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm">Graded</p>
              <h3 className="text-2xl font-bold">
                {assessments.filter(a => a.status === 'graded').length}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Assessments</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active">
            <TabsList>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="drafts">Drafts</TabsTrigger>
              <TabsTrigger value="submitted">Submitted</TabsTrigger>
              <TabsTrigger value="graded">Graded</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="mt-4">
              {isLoading ? (
                <div className="text-center py-4 text-muted-foreground">Loading...</div>
              ) : assessments.filter(a => a.status === 'active').length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No active assessments</div>
              ) : (
                assessments
                  .filter(a => a.status === 'active')
                  .map(renderAssessmentItem)
              )}
            </TabsContent>

            <TabsContent value="drafts" className="mt-4">
              {isLoading ? (
                <div className="text-center py-4 text-muted-foreground">Loading...</div>
              ) : assessments.filter(a => a.status === 'draft').length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No draft assessments</div>
              ) : (
                assessments
                  .filter(a => a.status === 'draft')
                  .map(renderAssessmentItem)
              )}
            </TabsContent>

            <TabsContent value="submitted" className="mt-4">
              {isLoading ? (
                <div className="text-center py-4 text-muted-foreground">Loading...</div>
              ) : assessments.filter(a => a.status === 'submitted').length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No submitted assessments</div>
              ) : (
                assessments
                  .filter(a => a.status === 'submitted')
                  .map(renderAssessmentItem)
              )}
            </TabsContent>

            <TabsContent value="graded" className="mt-4">
              {isLoading ? (
                <div className="text-center py-4 text-muted-foreground">Loading...</div>
              ) : assessments.filter(a => a.status === 'graded').length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No graded assessments</div>
              ) : (
                assessments
                  .filter(a => a.status === 'graded')
                  .map(renderAssessmentItem)
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
