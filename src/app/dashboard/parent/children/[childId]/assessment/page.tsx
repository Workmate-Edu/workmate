"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ParentAssessmentForm } from "@/components/forms/parent-assessment-form"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface ParentAssessmentPageProps {
  params: {
    childId: string
  }
}

export default function ParentAssessmentPage({ params }: ParentAssessmentPageProps) {
  const router = useRouter()

  const onSubmit = async (data: any) => {
    try {
      console.log('Submitting assessment:', data)

      const response = await fetch(`/api/parent/children/${params.childId}/assessment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to submit assessment')
      }

      toast.success('Assessment submitted successfully!')
      router.push(`/dashboard/parent/children/${params.childId}`)
      router.refresh()
    } catch (error) {
      console.error('Submission error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to submit assessment')
    }
  }

  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href={`/dashboard/parent/children/${params.childId}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Child Details
          </Link>
        </Button>
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Parent Assessment Questionnaire</h1>
          <p className="text-muted-foreground">
            Help us understand your child's learning needs, preferences, and goals
          </p>
        </div>
        <ParentAssessmentForm childId={params.childId} onSubmit={onSubmit} />
      </div>
    </div>
  )
}
