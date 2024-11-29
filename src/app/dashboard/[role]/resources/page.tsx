"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FiFolder, FiFile, FiUpload, FiSearch, FiGrid, FiList } from "react-icons/fi"

export default function ResourcesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isUploading, setIsUploading] = useState(false)

  const mockResources = [
    {
      id: 1,
      name: "Algebra Fundamentals.pdf",
      type: "PDF",
      size: "2.4 MB",
      subject: "Mathematics",
      lastModified: "2024-02-20",
    },
    {
      id: 2,
      name: "Physics Lab Guidelines.docx",
      type: "Document",
      size: "1.1 MB",
      subject: "Physics",
      lastModified: "2024-02-19",
    },
    {
      id: 3,
      name: "Chemistry Slides.pptx",
      type: "Presentation",
      size: "5.6 MB",
      subject: "Chemistry",
      lastModified: "2024-02-18",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight">Resources</h2>
          <Dialog open={isUploading} onOpenChange={setIsUploading}>
            <DialogTrigger asChild>
              <Button>
                <FiUpload className="w-4 h-4 mr-2" />
                Upload Resource
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Resource</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input placeholder="Resource title" />
                </div>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="math">Mathematics</SelectItem>
                      <SelectItem value="physics">Physics</SelectItem>
                      <SelectItem value="chemistry">Chemistry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>File</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <FiUpload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Drag and drop your file here, or click to browse
                    </p>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsUploading(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsUploading(false)}>
                    Upload
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-10" placeholder="Search resources..." />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              <SelectItem value="math">Mathematics</SelectItem>
              <SelectItem value="physics">Physics</SelectItem>
              <SelectItem value="chemistry">Chemistry</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex space-x-1 border rounded-md">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <FiGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <FiList className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Resources Grid/List */}
        <div className={viewMode === "grid" ? "grid gap-4 md:grid-cols-3" : "space-y-4"}>
          {mockResources.map((resource) => (
            <Card
              key={resource.id}
              className={`p-4 ${
                viewMode === "grid" ? "" : "flex items-center justify-between"
              }`}
            >
              <div className={viewMode === "grid" ? "space-y-4" : "flex items-center space-x-4"}>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FiFile className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-medium">{resource.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {resource.subject} • {resource.size}
                    </p>
                  </div>
                </div>
                {viewMode === "list" && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      Modified {resource.lastModified}
                    </span>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                )}
              </div>
              {viewMode === "grid" && (
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-sm text-muted-foreground">
                    Modified {resource.lastModified}
                  </span>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
