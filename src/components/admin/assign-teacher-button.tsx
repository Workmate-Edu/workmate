"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"
import { AssignTeacherDialog } from "./assign-teacher-dialog"

interface Subject {
  name: string
  area: string
  teacher?: {
    _id: string
    name: string
    email: string
    rating?: number
  }
}

interface TeacherAssignment {
  teacherId: string
  teacherName: string
  email: string
  rating?: number
  subject: {
    name: string
    area: string
  }
}

interface AssignTeacherButtonProps {
  studentId: string
  studentName: string
  studentType: 'independent' | 'child'
  subjects: Subject[]
  onAssigned?: () => void
  className?: string
  variant?: 'default' | 'outline'
  size?: 'default' | 'sm'
}

export function AssignTeacherButton({
  studentId,
  studentName,
  studentType,
  subjects,
  onAssigned,
  className,
  variant = 'default',
  size = 'default'
}: AssignTeacherButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [currentAssignments, setCurrentAssignments] = useState<TeacherAssignment[]>([])

  // Fetch current assignments when opening dialog
  const handleOpenDialog = async () => {
    try {
      const res = await fetch(`/api/admin/students/${studentId}/teachers`)
      if (res.ok) {
        const data = await res.json()
        // Transform the data to match TeacherAssignment interface
        const assignments: TeacherAssignment[] = data.map((assignment: any) => ({
          teacherId: assignment.teacher.id,
          teacherName: assignment.teacher.name,
          email: assignment.teacher.email,
          rating: assignment.teacher.rating,
          subject: assignment.subject
        }))
        setCurrentAssignments(assignments)
      }
    } catch (error) {
      console.error('Failed to fetch current assignments:', error)
    }
    setDialogOpen(true)
  }

  console.log('currentAssignments', currentAssignments)

  return (
    <>
      <Button 
        onClick={handleOpenDialog}
        className={className}
        variant={variant}
        size={size}
      >
        <UserPlus className="h-4 w-4 mr-2" />
        Assign Teacher
      </Button>

      <AssignTeacherDialog
        studentId={studentId}
        studentName={studentName}
        studentType={studentType}
        subjects={subjects}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAssigned={() => {
          onAssigned?.()
          setDialogOpen(false)
        }}
        currentAssignments={currentAssignments}
      />
    </>
  )
}
