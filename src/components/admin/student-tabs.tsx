"use client"

import { columns } from "./student-columns"
import { DataTable } from "@/components/ui/data-table"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"

interface Student {
  id: string
  name: string
  email?: string
  type: 'independent' | 'child'
  grade?: string
  subjects: any[]
  status: string
  // ... other properties
}

interface StudentTabsProps {
  independent: Student[]
  children: Student[]
  isLoading?: boolean
  showFilters?: boolean
}

export function StudentTabs({ 
  independent = [], // Provide default empty array
  children = [],   // Provide default empty array
  isLoading = false,
  showFilters = false 
}: StudentTabsProps) {
  const [search, setSearch] = useState("")

  const filterStudents = (students: any[]) => {
    if (!search) return students
    
    return students.filter(student => 
      student.name.toLowerCase().includes(search.toLowerCase()) ||
      student.email?.toLowerCase().includes(search.toLowerCase()) ||
      student.parentName?.toLowerCase().includes(search.toLowerCase())
    )
  }

  if (isLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <Card className="p-4">
      <Tabs defaultValue="independent" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="independent">
              Independent Students ({independent?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="children">
              Children ({children?.length || 0})
            </TabsTrigger>
          </TabsList>

          {showFilters && (
            <div className="max-w-xs">
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}
        </div>

        <TabsContent value="independent">
          <DataTable
            columns={columns}
            data={filterStudents(independent)}
            loading={isLoading}
          />
        </TabsContent>

        <TabsContent value="children">
          <DataTable
            columns={columns}
            data={filterStudents(children)}
            loading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </Card>
  )
}
