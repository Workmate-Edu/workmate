"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea" // Change to Textarea
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Upload, X, FileIcon } from "lucide-react"
import { uploadMessageFile } from "@/lib/message-upload" // Import upload helper

interface FileAttachment {
  file: File
  previewUrl: string
  name: string
  type: string
  size: number
  url?: string
}

interface Answer {
  text?: string;
  attachments?: FileAttachment[];
}

export default function EditSubmissionPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [assessment, setAssessment] = useState<any>(null)
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fileAnswers, setFileAnswers] = useState<Record<string, FileAttachment>>({})
  const [uploading, setUploading] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const response = await fetch(`/api/assessments/${params.id}`)
        if (!response.ok) throw new Error('Failed to fetch assessment')
        const data = await response.json()
        setAssessment(data)
        
        // Pre-populate answers from previous submission
        if (data.submissions?.[0]?.answers) {
          const existingAnswers = data.submissions[0].answers.reduce(
            (acc: any, curr: any) => ({
              ...acc,
              [curr.questionId]: curr.answer
            }),
            {}
          )
          setAnswers(existingAnswers)
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load assessment",
          variant: "destructive"
        })
      }
    }

    fetchAssessment()
  }, [params.id, toast])

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      // Format answers with attachments
      const formattedAnswers = Object.entries(answers)
        .filter(([_, answer]) => answer.text || answer.attachments?.length)
        .map(([questionId, answer]) => ({
          questionId,
          answer: answer.text || '',
          attachments: (answer.attachments || []).map(attachment => ({
            name: attachment.name,
            type: attachment.type,
            size: attachment.size,
            url: attachment.url,
            publicId: attachment.publicId
          }))
        }))

      console.log('Submitting formatted answers:', formattedAnswers)

      const response = await fetch(`/api/assessments/${params.id}/submit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: formattedAnswers })
      })

      if (!response.ok) throw new Error('Failed to update submission')

      const result = await response.json()
      console.log('Submission result:', result)

      toast({
        title: "Success",
        description: "Assessment updated successfully"
      })
      
      // Redirect to assessment detail page to see the updates
      router.push(`/dashboard/student/assessments/${params.id}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update assessment",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Helper function to extract publicId
  function extractPublicId(url: string): string {
    if (!url) return '';
    
    try {
      const matches = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
      if (matches && matches[1]) {
        return matches[1].split('?')[0];
      }
      return '';
    } catch (error) {
      console.error('Error extracting public ID:', error);
      return '';
    }
  }

  // Update handleFileSelect to handle multiple files
  const handleFileSelect = async (questionId: string, files: FileList) => {
    try {
      setUploading(prev => ({ ...prev, [questionId]: true }))
      
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)

        const uploadResponse = await fetch('/api/assessments/upload', {
          method: 'POST',
          body: formData
        })

        if (!uploadResponse.ok) throw new Error('Upload failed')

        const uploadResult = await uploadResponse.json()
        console.log('File upload result:', uploadResult)

        const newAttachment = {
          file,
          previewUrl: URL.createObjectURL(file),
          name: file.name,
          type: file.type,
          size: file.size,
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id
        }

        setAnswers(prev => ({
          ...prev,
          [questionId]: {
            text: prev[questionId]?.text || '',
            attachments: [...(prev[questionId]?.attachments || []), newAttachment]
          }
        }))
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error("Failed to upload files")
    } finally {
      setUploading(prev => ({ ...prev, [questionId]: false }))
    }
  }

  const removeAttachment = (questionId: string, index: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        attachments: prev[questionId]?.attachments?.filter((_, i) => i !== index)
      }
    }))
  }

  if (!assessment) {
    return <div> <Loader2 /> </div>
  }

  return (
    <div className="container max-w-3xl mx-auto p-6">
      <Card className="p-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Update Submission</h1>
            <p className="text-muted-foreground mt-2">{assessment.title}</p>
          </div>

          <div className="space-y-6">
            {assessment.questions.map((question: any) => (
              <Card key={question.id} className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{question.question}</p>
                    <Badge>{question.type}</Badge>
                  </div>

                  <div className="space-y-4">
                    <Textarea
                      value={answers[question.id]?.text || ''}
                      onChange={(e) => 
                        setAnswers(prev => ({
                          ...prev,
                          [question.id]: {
                            ...prev[question.id],
                            text: e.target.value
                          }
                        }))
                      }
                      placeholder="Your answer"
                      rows={4}
                      className="resize-none" // Add this class
                    />

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">
                          Attachments (optional)
                        </span>
                        <input
                          type="file"
                          id={`file-${question.id}`}
                          className="hidden"
                          multiple // Add multiple attribute
                          onChange={(e) => {
                            if (e.target.files?.length) {
                              handleFileSelect(question.id, e.target.files)
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById(`file-${question.id}`)?.click()}
                          disabled={uploading[question.id]}
                        >
                          {uploading[question.id] ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Upload className="h-4 w-4 mr-2" />
                          )}
                          Attach Files
                        </Button>
                      </div>

                      {/* Display multiple attachments */}
                      {answers[question.id]?.attachments?.length > 0 && (
                        <div className="space-y-2">
                          {answers[question.id].attachments.map((attachment, index) => (
                            <div 
                              key={`${attachment.name}-${index}`} 
                              className="flex items-center gap-2 p-2 border rounded"
                            >
                              <FileIcon className="h-4 w-4" />
                              <span className="flex-1 truncate">{attachment.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {(attachment.size / 1024 / 1024).toFixed(2)} MB
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  URL.revokeObjectURL(attachment.previewUrl)
                                  removeAttachment(question.id, index)
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Submission'
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
