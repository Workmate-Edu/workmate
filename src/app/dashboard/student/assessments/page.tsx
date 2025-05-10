"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Assessment } from "@/types/assessment"
import { useRouter } from "next/navigation"
import { 
  Calendar, 
  Clock, 
  FileText, 
  CheckCircle, // Changed from Grade to CheckCircle
  Loader2
} from "lucide-react"

interface Assessment {
  id: string;
  title: string;
  subject: string;
  type: string;
  status: 'active' | 'submitted' | 'graded';
  dueDate: string;
  points: number;
  grade?: number;
  totalPoints?: number; // Add total points
  questions?: Array<{
    points: number;
  }>;
}

export default function StudentAssessmentsPage() {
  const router = useRouter()
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchAssessments() {
      try {
        const response = await fetch('/api/student/assessments')
        if (!response.ok) throw new Error('Failed to fetch assessments')
        const data = await response.json()
        setAssessments(data)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAssessments()
  }, [])

  const calculateTotalPoints = (assessment: Assessment) => {
    // Calculate from questions if available
    if (assessment.questions?.length) {
      return assessment.questions.reduce((sum, q) => sum + (q.points || 0), 0);
    }
    // Fallback to totalPoints if set
    return assessment.totalPoints || 0;
  };

  const renderAssessmentCard = (assessment: Assessment) => (
    <Card key={assessment.id} className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold">{assessment.title}</h3>
            <p className="text-sm text-muted-foreground">{assessment.subject}</p>
          </div>
          <div className="flex items-center gap-2">
            {assessment.status === 'graded' && (
              <div className="text-right mr-4">
                <p className="text-sm text-muted-foreground">Grade</p>
                <p className="font-bold text-green-600">
                  {assessment.grade || 0}/{calculateTotalPoints(assessment)}
                </p>
              </div>
            )}
            <Button 
              onClick={() => router.push(`/dashboard/student/assessments/${assessment.id}`)}
            >
              {assessment.status === 'active' ? 'Start' : 'View'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Due: {new Date(assessment.dueDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{calculateTotalPoints(assessment)} points</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>{assessment.type.replace('_', ' ')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderContent = (status: 'active' | 'submitted' | 'graded') => {
    if (isLoading) {
      return <div className="text-center py-4 text-muted-foreground">Loading...</div>
    }

    const filteredAssessments = assessments.filter(a => a.status === status)
    
    if (filteredAssessments.length === 0) {
      const messages = {
        active: 'No pending assessments',
        submitted: 'No submitted assessments',
        graded: 'No graded assessments'
      }
      return <div className="text-center py-4 text-muted-foreground">{messages[status]}</div>
    }

    return filteredAssessments.map(renderAssessmentCard)
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">My Assessments</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Clock className="h-6 w-6 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">
                  {assessments.filter(a => a.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <FileText className="h-6 w-6 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Submitted</p>
                <p className="text-2xl font-bold">
                  {assessments.filter(a => a.status === 'submitted').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Graded</p>
                <p className="text-2xl font-bold">
                  {assessments.filter(a => a.status === 'graded').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="submitted">Submitted</TabsTrigger>
          <TabsTrigger value="graded">Graded</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {renderContent('active')}
        </TabsContent>

        <TabsContent value="submitted" className="mt-6">
          {renderContent('submitted')}
        </TabsContent>

        <TabsContent value="graded" className="mt-6">
          {renderContent('graded')}
        </TabsContent>
      </Tabs>
    </div>
  )
}
