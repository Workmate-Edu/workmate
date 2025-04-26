"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { CreateQuestionDialog } from "./create-question-dialog"
import { questionColumns } from "./columns"
import type { QuestionBank } from "@/types/questions"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { Skeleton } from "@/components/ui/skeleton"

export default function TeacherQuestionsPage() {
  const { data: session } = useSession()
  const [questions, setQuestions] = useState<QuestionBank[]>([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const fetchQuestions = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/questions')
      
      if (!res.ok) {
        throw new Error("Failed to fetch questions")
      }
      
      const data = await res.json()
      setQuestions(data)
    } catch (error) {
      toast.error("Failed to load questions")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user) {
      fetchQuestions()
    }
  }, [session])

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card className="p-6">
          <Skeleton className="h-64 w-full" />
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Question Bank</h1>
          <p className="text-muted-foreground">
            Create and manage your questions for assessments
          </p>
        </div>

        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Question
        </Button>
      </div>

      <Card className="p-6">
        <DataTable 
          columns={questionColumns} 
          data={questions}
          filterColumn="subject.name"
          searchPlaceholder="Search questions..."
        />
      </Card>

      <CreateQuestionDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen}
        onSuccess={fetchQuestions}
      />
    </div>
  )
}
