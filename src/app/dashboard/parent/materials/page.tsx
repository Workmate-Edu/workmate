"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileIcon, User, GraduationCap } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

interface DocumentInfo {
  id: string
  name: string
  description?: string
  url: string
  format: string
  uploadedAt: string
}

interface CourseDocuments {
  courseId: string
  courseName: string
  area: string
  documents: DocumentInfo[]
}

interface MaterialsData {
  personal?: {
    courses: CourseDocuments[]
  }
  children: Array<{
    id: string
    name: string
    courses: CourseDocuments[]
  }>
}

export default function ParentMaterialsPage() {
  const [materialsData, setMaterialsData] = useState<MaterialsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMaterials() {
      try {
        const response = await fetch('/api/parent/materials')
        if (!response.ok) throw new Error('Failed to fetch materials')
        const data = await response.json()
        setMaterialsData(data)
      } catch (error) {
        console.error('Error:', error)
        toast.error('Failed to load materials')
      } finally {
        setLoading(false)
      }
    }

    fetchMaterials()
  }, [])

  if (loading) return <div className="container py-8 animate-pulse">
    {/* ...loading state... */}
  </div>

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Course Materials</h1>

      <Tabs defaultValue={materialsData?.personal ? "personal" : "children"}>
        <TabsList>
          {materialsData?.personal && (
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              My Materials
            </TabsTrigger>
          )}
          <TabsTrigger value="children" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Children's Materials
          </TabsTrigger>
        </TabsList>

        {materialsData?.personal && (
          <TabsContent value="personal">
            <div className="space-y-6">
              {materialsData.personal.courses.map(course => (
                <CourseDocumentsCard key={course.courseId} course={course} />
              ))}
            </div>
          </TabsContent>
        )}

        <TabsContent value="children">
          <Tabs defaultValue={materialsData?.children[0]?.id}>
            <TabsList>
              {materialsData?.children.map(child => (
                <TabsTrigger key={child.id} value={child.id}>
                  {child.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {materialsData?.children.map(child => (
              <TabsContent key={child.id} value={child.id}>
                <div className="space-y-6">
                  {child.courses.map(course => (
                    <CourseDocumentsCard key={course.courseId} course={course} />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function CourseDocumentsCard({ course }: { course: CourseDocuments }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{course.courseName} - {course.area}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {course.documents.map(doc => (
            <DocumentRow key={doc.id} document={doc} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function DocumentRow({ document }: { document: DocumentInfo }) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-3">
        <FileIcon className="h-5 w-5 text-muted-foreground" />
        <div>
          <p className="font-medium">{document.name}</p>
          {document.description && (
            <p className="text-sm text-muted-foreground">{document.description}</p>
          )}
        </div>
      </div>
      <a
        href={document.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-primary hover:underline"
      >
        Download
      </a>
    </div>
  )
}
