"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Eye } from "lucide-react"
import { AssignTeacherDialog } from "./assign-teacher-dialog"
import { ViewAssessmentDialog } from "./view-assessment-dialog"
import { AssignTeacherButton } from "./assign-teacher-button"

interface Assessment {
  _id: string
  type: 'initial' | 'parent_questionnaire'
  status: string
  submittedAt: string
  responses: any[]
  student: {
    name: string
    email: string
    grade?: string
  }
  studentId?: {
    id: string
    name: string
    email: string
    grade?: string
  }
  child?: {
    id: string
    name: string
    grade: string
    subjects: Array<{
      name: string
      area: string
    }>
  }
  parent?: {
    name: string
    email: string
  }
  subject?: {
    name: string
    area: string
  }
}

interface AssessmentState {
  initial: Assessment[]
  child: Assessment[]
  isLoading: boolean
  error: string | null
}

export function PendingAssessments() {
  const [assessmentState, setAssessmentState] = useState<AssessmentState>({
    initial: [],
    child: [],
    isLoading: true,
    error: null
  })

  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)

  const fetchAssessments = async () => {
    try {
      setAssessmentState(prev => ({ ...prev, isLoading: true, error: null }))
      const response = await fetch('/api/admin/assessments')
      if (!response.ok) throw new Error('Failed to fetch assessments')
      const data = await response.json()
      setAssessmentState({
        initial: data.assessments.initial || [],
        child: data.assessments.child || [],
        isLoading: false,
        error: null
      })
    } catch (error) {
      console.error('Error fetching assessments:', error)
      setAssessmentState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load assessments'
      }))
    }
  }

  useEffect(() => {
    fetchAssessments()
  }, [])

  const handleAssignTeacher = async () => {
    try {
      await fetchAssessments()
      toast.success('Teacher assigned successfully')
      setShowAssignDialog(false)
      setShowViewDialog(false)
      setSelectedAssessment(null)
    } catch (error) {
      toast.error('Failed to assign teacher')
    }
  }

  const handleViewDetails = (assessment: Assessment) => {
    setSelectedAssessment(assessment)
    setShowViewDialog(true)
    setShowAssignDialog(false)
  }

  const handleAssignClick = (assessment: Assessment) => {
    setSelectedAssessment(assessment)
    setShowAssignDialog(true)
    setShowViewDialog(false)
  }

  const renderAssessmentGrid = (assessments: Assessment[], isStudent: boolean) => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {assessments.map(assessment => (
        <Card key={assessment._id} className="p-6">
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="font-medium">
                {assessment.student.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isStudent ? (
                  `${assessment.subject?.name || 'N/A'} • ${assessment.subject?.area || 'N/A'}`
                ) : (
                  <>
                    {assessment.student.grade ? `Grade ${assessment.student.grade} • ` : ''}
                    Parent: {assessment.parent?.name || 'Not available'}
                  </>
                )}
              </p>
              {!isStudent && assessment.parent?.email && (
                <p className="text-xs text-muted-foreground mt-1">
                  {assessment.parent.email}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-2 whitespace-nowrap"
                onClick={() => handleViewDetails(assessment)}
              >
                <Eye className="h-4 w-4" />
                View
              </Button>
              <AssignTeacherButton
                studentId={isStudent ? assessment.studentId?.id : assessment.child?.id}
                studentName={isStudent ? assessment.studentId?.name : assessment.child?.name}
                studentType={isStudent ? 'independent' : 'child'}
                grade={!isStudent ? assessment.child?.grade : undefined}
                subjects={isStudent ? [assessment.subject!] : assessment.child?.subjects}
                onAssigned={fetchAssessments}
                className="flex-1"
              />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )

  if (assessmentState.isLoading) {
    return <div className="flex justify-center p-8">Loading assessments...</div>
  }

  if (assessmentState.error) {
    return (
      <div className="flex justify-center p-8 text-red-500">
        {assessmentState.error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <Tabs defaultValue="students" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
            <TabsTrigger value="students">Student Assessments</TabsTrigger>
            <TabsTrigger value="children">Child Assessments</TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <p>{assessmentState.initial.length} pending assessments</p>
            </div>
            {assessmentState.initial.length > 0 ? (
              renderAssessmentGrid(assessmentState.initial, true)
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No pending student assessments
              </p>
            )}
          </TabsContent>

          <TabsContent value="children" className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <p>{assessmentState.child.length} pending assessments</p>
            </div>
            {assessmentState.child.length > 0 ? (
              renderAssessmentGrid(assessmentState.child, false)
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No pending child assessments
              </p>
            )}
          </TabsContent>
        </Tabs>
      </Card>

      {selectedAssessment && (
        <ViewAssessmentDialog
          assessment={selectedAssessment}
          open={showViewDialog}
          onOpenChange={(open) => {
            setShowViewDialog(open)
            if (!open) {
              setSelectedAssessment(null)
            }
          }}
          onAssign={() => {
            setShowViewDialog(false)
            setShowAssignDialog(true)
          }}
        />
      )}

      {selectedAssessment && (
        <AssignTeacherDialog
          assessment={selectedAssessment}
          open={showAssignDialog}
          onOpenChange={(open) => {
            setShowAssignDialog(open)
            if (!open) {
              setSelectedAssessment(null)
            }
          }}
          onAssigned={handleAssignTeacher}
        />
      )}
    </div>
  )
}
