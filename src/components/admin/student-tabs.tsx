"use client"

import { columns } from "./student-columns"
import { DataTable } from "@/components/ui/data-table"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { ListSearch } from "@/components/ui/list-search"

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
    
    const query = search.trim().toLowerCase()
    return students.filter(student => [
      student.name,
      student.email,
      student.parentName,
      student.parentEmail,
      student.grade,
      ...(student.subjects || []).flatMap((subject: any) => [subject.name, subject.area]),
    ].some(value => String(value || '').toLowerCase().includes(query)))
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
            <ListSearch value={search} onValueChange={setSearch} placeholder="Search students and children..." />
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
