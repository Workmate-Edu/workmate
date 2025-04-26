"use client"

import { useEffect, useState } from "react"
import { columns } from "./teacher-columns"
import { DataTable } from "@/components/ui/data-table"
import { Card } from "@/components/ui/card"
import { TeacherDetailsDialog } from "./teacher-details-dialog"
import { toast } from "sonner"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { TeacherRejectionDialog } from "./teacher-rejection-dialog"

interface Teacher {
  _id: string
  name: string
  email: string
  phone: string
  bio: string
  teacherProfile: {
    verificationStatus: string
    qualifications: Array<{
      degree: string
      institution: string
      year: number
    }>
    subjects: Array<{
      area: string
      subjects: string[]
    }>
    rating: number
    students: Array<any>
    reviews: Array<{
      rating: number
      comment: string
    }>
    reapplicationCount: number
    lastUpdated: Date
  }
}

export function TeacherList({ status }: { status: string }) {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [rejectionDialog, setRejectionDialog] = useState<{
    isOpen: boolean;
    teacher: Teacher | null;
  }>({ isOpen: false, teacher: null });
  const [verifyDialog, setVerifyDialog] = useState<{
    isOpen: boolean;
    teacher: Teacher | null;
  }>({ isOpen: false, teacher: null });
  const [verifyLoading, setVerifyLoading] = useState(false)

  useEffect(() => {
    fetchTeachers()
  }, [status])

  const fetchTeachers = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/teachers?status=${status}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch teachers')
      }
      
      setTeachers(data.teachers || [])
    } catch (error) {
      console.error('Failed to fetch teachers:', error)
      toast.error("Failed to load teachers")
      setTeachers([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (teacher: Teacher) => {
    try {
      setVerifyLoading(true)
      const response = await fetch(`/api/admin/teachers/${teacher._id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'verified' })
      });

      if (!response.ok) throw new Error('Failed to verify teacher');

      // Close dialogs and clear selections
      setVerifyDialog({ isOpen: false, teacher: null });
      setSelectedTeacher(null);

      // Refresh data and show success message
      await fetchTeachers();
      toast.success('Teacher verified successfully');
    } catch (error) {
      toast.error('Failed to verify teacher');
    } finally {
      setVerifyLoading(false)
    }
  };

  const handleReject = async ({ reason, feedback }: { reason: string, feedback: string }) => {
    if (!rejectionDialog.teacher) return

    try {
      const response = await fetch(`/api/admin/teachers/${rejectionDialog.teacher._id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'rejected',
          reason,
          feedback
        })
      })

      if (!response.ok) {
        throw new Error('Failed to reject teacher')
      }

      // First close dialog and clear selection
      setRejectionDialog({ isOpen: false, teacher: null })
      setSelectedTeacher(null)
      
      // Then refresh the teachers list and show success message
      await fetchTeachers()
      toast.success('Teacher application rejected')
    } catch (error) {
      toast.error('Failed to reject teacher')
      throw error
    }
  }

  const handleViewDetails = (teacher: Teacher) => {
    console.log('Viewing teacher:', teacher);
    setSelectedTeacher(teacher);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <DataTable
          columns={columns}
          data={teachers}
          searchKey="name"
          searchPlaceholder="Search teachers..."
          loading={loading}
          onRowClick={handleViewDetails} // Add this prop
          meta={{
            onViewDetails: handleViewDetails // Pass the handler
          }}
        />
      </Card>

      {/* Verify Confirmation Dialog */}
      {verifyDialog.teacher && (
        <ConfirmationDialog
          isOpen={verifyDialog.isOpen}
          onClose={() => !verifyLoading && setVerifyDialog({ isOpen: false, teacher: null })}
          onConfirm={async () => {
            await handleVerify(verifyDialog.teacher!);
          }}
          title="Verify Teacher"
          description={`Are you sure you want to verify ${verifyDialog.teacher.name}? This will allow them to be assigned to students.`}
          confirmText={verifyLoading ? "Verifying..." : "Verify"}
          isLoading={verifyLoading}
        />
      )}

      {/* TeacherDetailsDialog */}
      <TeacherDetailsDialog
        isOpen={!!selectedTeacher}
        teacher={selectedTeacher}
        onClose={() => {
          console.log('Closing dialog');
          setSelectedTeacher(null);
        }}
        onVerify={
          status === 'pending' 
            ? (teacher) => setVerifyDialog({ isOpen: true, teacher })
            : undefined
        }
        onReject={
          status === 'pending'
            ? (teacher) => setRejectionDialog({ isOpen: true, teacher })
            : undefined
        }
      />

      {/* Existing TeacherRejectionDialog */}
      {rejectionDialog.teacher && (
        <TeacherRejectionDialog
          isOpen={rejectionDialog.isOpen}
          teacherName={rejectionDialog.teacher.name}
          onClose={() => setRejectionDialog({ isOpen: false, teacher: null })}
          onReject={handleReject}
        />
      )}
    </div>
  )
}
