"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, UserCheck } from "lucide-react"

interface ChildAssessmentProps {
  _id: string
  name: string
  grade: string
  assessmentStatus: 'none' | 'pending' | 'assigned'
  assignedTeacher?: {
    name: string
    email: string
    assignedAt: string
  }
  assessmentCompletion?: {
    completedAt: string
    notes: string
  }
}

export function ChildAssessments({ assessments }: { assessments: ChildAssessmentProps[] }) {
  const getStatusBadge = (status: string) => {
    const variants = {
      none: 'secondary',
      pending: 'warning',
      teacher_assigned: 'default',
      completed: 'success'
    }
    return variants[status] || 'secondary'
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      none: 'Not Started',
      pending: 'Under Review',
      teacher_assigned: 'Teacher Assigned',
      completed: 'Completed'
    }
    return labels[status] || status
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {assessments.map((assessment) => (
        <Card key={assessment._id} className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{assessment.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Grade {assessment.grade}
                </p>
              </div>
              <Badge variant={getStatusBadge(assessment.assessmentStatus)}>
                {getStatusLabel(assessment.assessmentStatus)}
              </Badge>
            </div>

            {assessment.assessmentStatus === 'completed' && assessment.assignedTeacher && (
              <div className="border-t pt-3">
                <div className="flex items-center gap-2 mb-2">
                  <UserCheck className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Assigned Teacher</span>
                </div>
                <p className="text-sm">{assessment.assignedTeacher.name}</p>
                <p className="text-xs text-muted-foreground">
                  Assigned on {new Date(assessment.assignedTeacher.assignedAt).toLocaleDateString()}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1 gap-2"
                onClick={() => {/* Handle view details */}}
              >
                <Eye className="h-4 w-4" />
                View Details
              </Button>
            </div>

            {assessment.assessmentCompletion && (
              <div className="text-xs text-muted-foreground mt-2">
                Completed on {new Date(assessment.assessmentCompletion.completedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}
