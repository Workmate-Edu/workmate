"use client"

import { TeacherTabs } from "@/components/admin/teacher-tabs"
import { Card } from "@/components/ui/card"

export default function TeachersPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Teachers Management</h1>
      <Card className="p-6">
        <TeacherTabs />
      </Card>
    </div>
  )
}
