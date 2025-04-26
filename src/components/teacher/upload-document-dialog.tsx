"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Upload, X, Loader2, FileIcon } from "lucide-react"
import { Switch } from "@/components/ui/switch"

interface UploadDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subjects: Array<{ id: string; name: string; area: string }>
  onSuccess?: () => void
}

interface FileAttachment {
  file: File
  previewUrl: string
  name: string
  type: string
  size: number
}

const ALLOWED_TYPES = [
  // Images
  'image/jpeg',
  'image/png',
  'image/jpg',
  
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation'
]

export function UploadDocumentDialog({
  open,
  onOpenChange,
  subjects,
  onSuccess
}: UploadDocumentDialogProps) {
  const { toast } = useToast()
  const [attachment, setAttachment] = useState<FileAttachment | null>(null)
  const [selectedSubjects, setSelectedSubjects] = useState<Array<{ id: string; name: string; area: string }>>([])
  const [description, setDescription] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isGeneral, setIsGeneral] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      resetForm()
    }
  }, [open])

  const handleFile = (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({
        variant: "destructive",
        description: "Unsupported file type. Please upload a PDF, Word, PowerPoint, or image file."
      })
      resetFileInput()
      return
    }

    const previewUrl = URL.createObjectURL(file)
    setAttachment({
      file,
      previewUrl,
      name: file.name,
      type: file.type,
      size: file.size
    })
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.currentTarget === dropZoneRef.current) {
      setIsDragging(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const resetForm = () => {
    if (attachment?.previewUrl) {
      URL.revokeObjectURL(attachment.previewUrl)
    }
    setAttachment(null)
    setSelectedSubjects([])
    setDescription("")
    setIsGeneral(false)
    resetFileInput()
  }

  const toggleSubject = (subject: { id: string; name: string; area: string }) => {
    setSelectedSubjects(prev => {
      const exists = prev.some(s => s.id === subject.id)
      if (exists) {
        return prev.filter(s => s.id !== subject.id)
      }
      return [...prev, subject]
    })
  }

  const handleUpload = async () => {
    if (!attachment || (!isGeneral && selectedSubjects.length === 0)) {
      toast({
        description: "Please select a file and at least one subject, or mark as general"
      })
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', attachment.file)

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!uploadRes.ok) {
        const error = await uploadRes.json()
        throw new Error(error.error || 'Failed to upload file')
      }

      const { secure_url, public_id } = await uploadRes.json()

      const docRes = await fetch('/api/teacher/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: attachment.name,
          description,
          subjects: selectedSubjects,
          url: secure_url,
          publicId: public_id,
          format: attachment.type,
          size: attachment.size,
          isGeneral
        })
      })

      if (!docRes.ok) {
        throw new Error('Failed to create document record')
      }

      toast({
        description: "Document uploaded successfully"
      })
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        variant: "destructive",
        description: error instanceof Error ? error.message : "Failed to upload document"
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Document</Label>
            <div 
              ref={dropZoneRef}
              className={`mt-2 border-2 border-dashed rounded-lg transition-colors ${
                isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
              }`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {attachment ? (
                <div className="p-4">
                  <div className="flex items-center gap-2">
                    <FileIcon className="h-8 w-8 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{attachment.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(attachment.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setAttachment(null)
                        resetFileInput()
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="relative p-6">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFile(file)
                    }}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground/25" />
                    <p className="mt-2 text-sm font-medium">
                      Drag and drop your file here or click to browse
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      PDF, Word, PowerPoint or Images up to 10MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Subject</Label>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={isGeneral}
                  onCheckedChange={(checked) => {
                    setIsGeneral(checked)
                    if (checked) {
                      setSelectedSubjects([])
                    }
                  }}
                />
                <span className="text-sm text-muted-foreground">
                  General Document
                </span>
              </div>
            </div>
            
            {!isGeneral && (
              <div className="mt-2 flex flex-wrap gap-2">
                {subjects.map(subject => (
                  <Button
                    key={subject.id}
                    type="button"
                    variant={selectedSubjects.some(s => s.id === subject.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleSubject(subject)}
                  >
                    {subject.name}
                  </Button>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label>Description (optional)</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                resetForm()
                onOpenChange(false)
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!attachment || (!isGeneral && selectedSubjects.length === 0) || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
