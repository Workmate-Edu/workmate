"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { QuestionBank } from "@/types/questions"
import { ReviewDialog } from "./review-dialog"

const columns = [
  {
    accessorKey: "subject.name",
    header: "Subject",
  },
  {
    accessorKey: "level",
    header: "Level",
  },
  {
    accessorKey: "createdBy",
    header: "Teacher",
  },
  {
    accessorKey: "verification.status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("verification.status")
      return (
        <Badge variant={
          status === 'pending' ? 'outline' :
          status === 'approved' ? 'success' :
          'destructive'
        }>
          {status}
        </Badge>
      )
    }
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Button 
        variant="outline"
        onClick={() => handleReview(row.original)}
      >
        Review
      </Button>
    ),
  }
]

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<QuestionBank[]>([])
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionBank | null>(null)
  const [isReviewOpen, setIsReviewOpen] = useState(false)

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      const res = await fetch('/api/questions?status=pending')
      const data = await res.json()
      setQuestions(data)
    } catch (error) {
      console.error('Failed to fetch questions:', error)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Question Review</h1>
          <p className="text-muted-foreground">
            Review and approve teacher submitted questions
          </p>
        </div>
      </div>

      <Card className="p-6">
        <DataTable 
          columns={columns}
          data={questions}
          filterColumn="verification.status"
          searchPlaceholder="Search questions..."
        />
      </Card>

      <ReviewDialog 
        question={selectedQuestion}
        open={isReviewOpen}
        onOpenChange={setIsReviewOpen}
        onReviewComplete={fetchQuestions}
      />
    </div>
  )
}
