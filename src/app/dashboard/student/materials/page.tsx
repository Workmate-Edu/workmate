"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileIcon } from "lucide-react"
import { toast } from "sonner"

interface CourseDocument {
  id: string
  name: string
  description?: string
  url: string
  format: string
  size: number
  uploadedAt: string
  courseName: string
}

export default function StudentMaterialsPage() {
  const [documents, setDocuments] = useState<CourseDocument[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const response = await fetch('/api/student/materials')
        if (!response.ok) throw new Error('Failed to fetch materials')
        const data = await response.json()
        setDocuments(data)
      } catch (error) {
        console.error('Error:', error)
        toast.error('Failed to load materials')
      } finally {
        setLoading(false)
      }
    }

    fetchDocuments()
  }, [])

  if (loading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Course Materials</h1>
      
      {documents.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <FileIcon className="h-12 w-12 text-muted-foreground" />
            <h2 className="text-xl font-semibold">No Materials Available</h2>
            <p className="text-muted-foreground">
              No course materials have been shared with you yet.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <Card key={doc.id}>
              <CardHeader>
                <CardTitle className="text-lg">{doc.courseName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <FileIcon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    {doc.description && (
                      <p className="text-sm text-muted-foreground">{doc.description}</p>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Download
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
