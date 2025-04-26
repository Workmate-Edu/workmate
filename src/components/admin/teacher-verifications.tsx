"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { TeacherRejectionDialog } from "./teacher-rejection-dialog"

interface TeacherVerification {
  _id: string
  name: string
  email: string
  qualifications: Array<{
    degree: string
    institution: string
    year: number
  }>
  subjects: Array<{
    area: string
    subjects: string[]
  }>
  status: 'pending' | 'verified' | 'rejected'
  createdAt: string
}

export function TeacherVerifications() {
  const [verifications, setVerifications] = useState<TeacherVerification[]>([])
  const [loading, setLoading] = useState(true)
  const [rejectionDialog, setRejectionDialog] = useState<{
    isOpen: boolean;
    teacherId: string;
    teacherName: string;
  }>({
    isOpen: false,
    teacherId: "",
    teacherName: ""
  })

  useEffect(() => {
    fetchVerifications()
  }, [])

  const fetchVerifications = async () => {
    try {
      const response = await fetch('/api/admin/teachers/verifications?status=pending')
      const data = await response.json()
      
      if (!response.ok) throw new Error(data.error)
      
      setVerifications(data.verifications)
    } catch (error) {
      toast.error("Failed to load teacher verifications")
    } finally {
      setLoading(false)
    }
  }

  const handleVerification = async (teacherId: string, status: 'verified' | 'rejected', reason?: string, feedback?: string) => {
    try {
      const response = await fetch(`/api/admin/teachers/${teacherId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reason, feedback })
      })

      if (!response.ok) throw new Error('Failed to update verification status')

      toast.success(`Teacher ${status === 'verified' ? 'verified' : 'rejected'} successfully`)
      
      // Refresh verifications and stats
      fetchVerifications()
      // Emit event for dashboard update
      window.dispatchEvent(new Event('adminDashboardUpdate'))
    } catch (error) {
      toast.error("Failed to update verification status")
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading verifications...</div>
  }

  if (verifications.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            No pending teacher verifications
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {verifications.map((teacher) => (
        <Card key={teacher._id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{teacher.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{teacher.email}</p>
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handleVerification(teacher._id, 'verified')}
                >
                  Verify
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setRejectionDialog({
                    isOpen: true,
                    teacherId: teacher._id,
                    teacherName: teacher.name
                  })}
                >
                  Reject
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Qualifications</h4>
                <div className="space-y-2">
                  {teacher.teacherProfile?.qualifications?.map((qual, i) => (
                    <div key={i} className="text-sm">
                      {qual.degree} - {qual.institution} ({qual.year})
                    </div>
                  )) || (
                    <p className="text-sm text-muted-foreground">No qualifications provided</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Subject Areas</h4>
                <div className="flex flex-wrap gap-2">
                  {teacher.teacherProfile?.subjects?.map((subject, i) => (
                    <Badge key={i} variant="secondary">
                      {subject.area}: {subject.subjects.join(", ")}
                    </Badge>
                  )) || (
                    <p className="text-sm text-muted-foreground">No subjects specified</p>
                  )}
                </div>
              </div>

              {/* Phone number */}
              <div>
                <h4 className="font-medium mb-2">Contact</h4>
                <p className="text-sm">{teacher.phone || 'No phone number provided'}</p>
              </div>

              {/* Bio */}
              <div>
                <h4 className="font-medium mb-2">Bio</h4>
                <p className="text-sm text-muted-foreground">{teacher.bio || 'No bio provided'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <TeacherRejectionDialog
        isOpen={rejectionDialog.isOpen}
        teacherName={rejectionDialog.teacherName}
        onClose={() => setRejectionDialog({ isOpen: false, teacherId: "", teacherName: "" })}
        onConfirm={async (reason, feedback) => {
          await handleVerification(rejectionDialog.teacherId, 'rejected', reason, feedback)
          setRejectionDialog({ isOpen: false, teacherId: "", teacherName: "" })
        }}
      />
    </div>
  )
}
