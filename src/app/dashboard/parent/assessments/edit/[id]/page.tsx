"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Upload, X, FileIcon, ArrowLeft } from "lucide-react"

interface FileAttachment {
  file: File
  previewUrl: string
  name: string
  type: string
  size: number
  url?: string
  publicId?: string
}

interface Answer {
  text?: string
  attachments?: FileAttachment[]
}

export default function ParentEditSubmissionPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()

  const [assessment, setAssessment] = useState<any>(null)
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploading, setUploading] = useState<Record<string, boolean>>({})

  // load existing answers
  useEffect(() => {
    fetch(`/api/parent/assessments/${id}`)
      .then(res => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then(data => {
        setAssessment(data)
        data.submission?.answers.forEach((a: any) => {
          setAnswers(prev => ({
            ...prev,
            [a.questionId]: { text: a.answer, attachments: a.attachments || [] }
          }))
        })
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Failed to load assessment",
          variant: "destructive"
        })
        router.back()
      })
  }, [id])

  async function handleFileSelect(questionId: string, files: FileList) {
    setUploading(u => ({ ...u, [questionId]: true }))
    try {
      for (const file of Array.from(files)) {
        const form = new FormData()
        form.append("file", file)
        const res = await fetch("/api/upload", { method: "POST", body: form })
        if (!res.ok) throw new Error()
        const { secure_url, public_id } = await res.json()
        const attachment: FileAttachment = {
          file,
          previewUrl: URL.createObjectURL(file),
          name: file.name,
          type: file.type,
          size: file.size,
          url: secure_url,
          publicId: public_id
        }
        setAnswers(prev => {
          const existing = prev[questionId]?.attachments || []
          return {
            ...prev,
            [questionId]: {
              text: prev[questionId]?.text,
              attachments: [...existing, attachment]
            }
          }
        })
      }
    } catch {
      toast({
        title: "Upload failed",
        variant: "destructive"
      })
    } finally {
      setUploading(u => ({ ...u, [questionId]: false }))
    }
  }

  function removeAttachment(questionId: string, idx: number) {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        attachments: prev[questionId].attachments!.filter((_, i) => i !== idx)
      }
    }))
  }

  async function handleSubmit() {
    setIsSubmitting(true)
    try {
      const payload = Object.entries(answers).map(([qid, ans]) => ({
        questionId: qid,
        answer: ans.text || "",
        attachments: ans.attachments?.map(att => ({
          name: att.name,
          url: att.url,
          publicId: att.publicId,
          type: att.type,
          size: att.size
        })) || []
      }))
      const res = await fetch(`/api/parent/assessments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: payload })
      })
      if (!res.ok) throw new Error()
      toast({ title: "Updated", description: "Your submission was saved." })
      router.push(`/dashboard/parent/assessment/${id}`)
    } catch {
      toast({
        title: "Error",
        description: "Failed to update",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!assessment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-6 w-6" />
      </div>
    )
  }

  return (
    <div className="container max-w-3xl mx-auto p-6">
      <Card className="p-8 space-y-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Cancel
        </Button>

        <h1 className="text-2xl font-bold">Update Submission</h1>
        <p className="text-muted-foreground">{assessment.title}</p>

        <div className="space-y-6">
          {assessment.questions.map((q: any) => (
            <Card key={q.id} className="p-6">
              <div className="flex justify-between items-center mb-4">
                <p className="font-medium">{q.question}</p>
                <Badge>{q.type}</Badge>
              </div>

              <Textarea
                value={answers[q.id]?.text || ""}
                onChange={e =>
                  setAnswers(prev => ({
                    ...prev,
                    [q.id]: { ...prev[q.id], text: e.target.value }
                  }))
                }
                rows={4}
                placeholder="Your answer"
              />

              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">
                    Attachments
                  </span>
                  <input
                    type="file"
                    id={`file-${q.id}`}
                    className="hidden"
                    multiple
                    onChange={e => {
                      if (e.target.files) handleFileSelect(q.id, e.target.files)
                    }}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      document.getElementById(`file-${q.id}`)?.click()
                    }
                    disabled={uploading[q.id]}
                  >
                    {uploading[q.id] ? (
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Attach
                  </Button>
                </div>

                {answers[q.id]?.attachments?.length > 0 && (
                  <div className="space-y-2">
                    {answers[q.id].attachments.map((att, i) => (
                      <div
                        key={`${att.name}-${i}`}
                        className="flex items-center gap-2 p-2 border rounded"
                      >
                        <FileIcon className="h-4 w-4" />
                        <span className="flex-1 truncate">{att.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(q.id, i)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
            ) : null}
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </Card>
    </div>
  )
}
