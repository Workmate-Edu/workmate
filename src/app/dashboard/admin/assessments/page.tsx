"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { PendingAssessments } from "@/components/admin/pending-assessments"

export default function AssessmentsPage() {
  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/admin" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <h1 className="text-2xl font-bold mb-8">Pending Assessments</h1>
      <PendingAssessments />
    </div>
  )
}
