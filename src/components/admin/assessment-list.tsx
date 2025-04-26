"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { toast } from "sonner"
import { AssignTeacherDialog } from "./assign-teacher-dialog"

const columns = [
  {
    accessorKey: "student.name",
    header: "Student Name"
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant="outline">
        {row.original.type === 'child' ? 'Child' : 'Student'}
      </Badge>
    )
  },
  {
    accessorKey: "student.grade",
    header: "Grade"
  },
  {
    accessorKey: "subjects",
    header: "Subjects",
    cell: ({ row }) => {
      const subjects = row.original.preferredSubjects || [];
      return (
        <div className="flex flex-wrap gap-1">
          {subjects.map((subject: any, index: number) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {subject.area}
            </Badge>
          ))}
        </div>
      );
    }
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Button
        variant="outline"
        size="sm"
        onClick={() => row.meta?.onAssign?.(row.original)}
      >
        Assign Teacher
      </Button>
    )
  }
];

export function AssessmentList() {
  const [assessments, setAssessments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAssessment, setSelectedAssessment] = useState(null)

  useEffect(() => {
    fetchAssessments()
  }, [])

  const fetchAssessments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/assessments?status=pending')
      const data = await response.json()
      
      if (!response.ok) throw new Error(data.error)
      
      setAssessments(data.assessments || [])
    } catch (error) {
      toast.error("Failed to load assessments")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Assessments</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={assessments}
          loading={loading}
          filterColumn="student.name"
          searchPlaceholder="Search by student name..."
          meta={{
            onAssign: setSelectedAssessment
          }}
        />

        {selectedAssessment && (
          <AssignTeacherDialog
            assessment={selectedAssessment}
            onClose={() => setSelectedAssessment(null)}
            onAssigned={() => {
              fetchAssessments();
              setSelectedAssessment(null);
            }}
          />
        )}
      </CardContent>
    </Card>
  )
}
