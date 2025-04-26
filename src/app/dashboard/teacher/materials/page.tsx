"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { UploadCloud, Folder, FileText, Loader2, FileImage, File, Trash2, Globe } from "lucide-react"
import { UploadDocumentDialog } from "@/components/teacher/upload-document-dialog"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"

interface Document {
  _id: string
  name: string
  url: string
  format: string
  createdAt: string
  size: number
  subjects: Array<{
    id: string
    name: string
    area: string
    _id: string
  }>
  description?: string
  isGeneral: boolean
}

interface Subject {
  _id: string
  id: string
  name: string
  area: string
}

interface Course {
  _id: string
  subjects: Array<{
    id: string
    name: string
    area: string
  }>
}

export default function MaterialsPage() {
  const { toast } = useToast()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [documents, setDocuments] = useState<Record<string, Document[]>>({})
  const [generalDocuments, setGeneralDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [documentToDelete, setDocumentToDelete] = useState<{doc: Document, subjectId?: string} | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  useEffect(() => {
    const loadData = async () => {
      await fetchTeacherSubjects()
      await fetchDocuments()
    }
    loadData()
  }, [refreshKey])

  const fetchTeacherSubjects = async () => {
    try {
      const response = await fetch('/api/teacher/courses')
      if (!response.ok) throw new Error('Failed to fetch courses')
      const courses: Course[] = await response.json()
      
      const extractedSubjects: Subject[] = courses.flatMap(course => 
        course.subjects.map(subject => ({
          _id: subject.id.split('-')[0],
          id: subject.id,
          name: subject.name,
          area: subject.area
        }))
      )
      
      const uniqueSubjects = Array.from(
        new Map(extractedSubjects.map(sub => [sub.id, sub])).values()
      ) as Subject[]
      
      setSubjects(uniqueSubjects)
    } catch (error) {
      console.error('Error fetching subjects:', error)
    }
  }

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/teacher/documents')
      if (!response.ok) throw new Error('Failed to fetch documents')
      const docs = await response.json()

      // Separate general and subject-specific documents
      const general: Document[] = []
      const docsBySubject: Record<string, Document[]> = {}
      
      docs.forEach((doc: Document) => {
        if (doc.isGeneral) {
          general.push({
            ...doc,
            createdAt: new Date(doc.createdAt).toLocaleString()
          })
        } else {
          // Add documents to their specific subject groups
          doc.subjects.forEach(subject => {
            if (!docsBySubject[subject.id]) {
              docsBySubject[subject.id] = []
            }
            docsBySubject[subject.id].push({
              ...doc,
              createdAt: new Date(doc.createdAt).toLocaleString()
            })
          })
        }
      })

      setGeneralDocuments(general)
      setDocuments(docsBySubject)
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadSuccess = () => {
    setLoading(true) // Show loading state while refreshing
    setRefreshKey(prev => prev + 1)
  }

  const handleDeleteDocument = async () => {
    if (!documentToDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/teacher/documents/${documentToDelete.doc._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subjectId: documentToDelete.subjectId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to delete document')
      }

      toast({
        description: "Document deleted successfully"
      })

      // Refresh documents list
      setRefreshKey(prev => prev + 1)
    } catch (error) {
      console.error('Delete error:', error)
      toast({
        variant: "destructive",
        description: "Failed to delete document"
      })
    } finally {
      setIsDeleting(false)
      setDocumentToDelete(null)
    }
  }

  const getFileIcon = (format: string) => {
    if (['jpg', 'jpeg', 'png', 'gif'].includes(format.toLowerCase())) return FileImage
    if (['pdf', 'doc', 'docx'].includes(format.toLowerCase())) return FileText
    return File
  }

  const getFormatLabel = (format: string) => {
    const formatType = format.split('/')[1]?.toUpperCase() || format.toUpperCase()
    return formatType === 'JPEG' ? 'JPG' : formatType
  }

  const truncateText = (text: string, maxLength: number = 40) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
  }

  const DocumentCard = ({ 
    title, 
    icon, 
    docs,
    showSubjectBadge = false,
    currentSubjectId
  }: { 
    title: string
    icon: React.ReactNode
    docs: Document[]
    showSubjectBadge?: boolean
    currentSubjectId?: string
  }) => (
    <Card className="overflow-hidden">
      <div className="border-b p-3 md:p-4 bg-muted/20">
        <div className="flex flex-wrap items-center gap-2">
          {icon}
          <h2 className="text-base md:text-lg font-semibold">{title}</h2>
          <Badge variant="secondary" className="ml-auto">
            {docs.length} {docs.length === 1 ? 'document' : 'documents'}
          </Badge>
        </div>
      </div>
      <ScrollArea className="h-full max-h-[400px]">
        {docs.length > 0 ? (
          <div className="grid gap-2 p-3 md:p-4">
            {docs.map(doc => {
              const FileIcon = getFileIcon(doc.format)
              return (
                <div
                  key={doc._id}
                  className="flex items-start md:items-center gap-3 p-2 md:p-3 rounded-lg border hover:bg-muted/50 transition-colors group flex-wrap md:flex-nowrap"
                >
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start md:items-center gap-3 flex-1 min-w-0"
                  >
                    <div className="p-2 rounded-md bg-muted group-hover:bg-background transition-colors">
                      <FileIcon className="h-4 w-4 md:h-5 md:w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate" title={doc.name}>
                        {truncateText(doc.name)}
                      </p>
                      {doc.description && (
                        <p className="text-xs md:text-sm text-muted-foreground truncate mt-0.5" title={doc.description}>
                          {truncateText(doc.description, 60)}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {getFormatLabel(doc.format)}
                        </Badge>
                        {showSubjectBadge && doc.subjects.map(subject => (
                          <Badge key={subject.id} variant="secondary" className="text-xs">
                            {subject.name}
                          </Badge>
                        ))}
                        <span className="text-xs text-muted-foreground">
                          {(doc.size / 1024 / 1024).toFixed(2)}MB
                        </span>
                        <span className="text-xs text-muted-foreground hidden sm:inline">
                          {doc.createdAt}
                        </span>
                      </div>
                    </div>
                  </a>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDocumentToDelete({ doc, subjectId: currentSubjectId })}
                    className="opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <FileText className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No documents uploaded {title !== "General Documents" ? `for ${title}` : ''} yet.
            </p>
            <Button 
              variant="link" 
              className="mt-2"
              onClick={() => setShowUploadDialog(true)}
            >
              Upload a document
            </Button>
          </div>
        )}
      </ScrollArea>
    </Card>
  )

  return (
    <div className="container mx-auto py-4 md:py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Teaching Materials</h1>
          <p className="text-muted-foreground mt-1">
            Upload and manage documents for your courses
          </p>
        </div>
        <Button 
          onClick={() => setShowUploadDialog(true)}
          className="w-full sm:w-auto"
        >
          <UploadCloud className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-6">
          {/* General Documents Card */}
          <DocumentCard
            title="General Documents"
            icon={<Globe className="h-5 w-5 text-muted-foreground" />}
            docs={generalDocuments}
            showSubjectBadge={true}
          />

          {/* Subject-specific Documents */}
          {subjects.map(subject => (
            <DocumentCard
              key={subject.id}
              title={subject.name}
              icon={<Folder className="h-5 w-5 text-muted-foreground" />}
              docs={documents[subject.id] || []}
              currentSubjectId={subject.id}
            />
          ))}

          {subjects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No subjects available. Add subjects to your courses to upload documents.
              </p>
            </div>
          )}
        </div>
      )}

      <UploadDocumentDialog 
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        subjects={subjects}
        onSuccess={handleUploadSuccess}
      />

      <AlertDialog 
        open={!!documentToDelete} 
        onOpenChange={(open) => {
          if (!isDeleting && !open) {
            setDocumentToDelete(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              {documentToDelete && documentToDelete.doc.subjects && documentToDelete.doc.subjects.length > 1 && documentToDelete.subjectId
                ? "This will remove the document from this subject only. The document will still be available in other subjects."
                : "Are you sure you want to delete this document? This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDocument}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
