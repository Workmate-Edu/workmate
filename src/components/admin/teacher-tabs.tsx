"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TeacherList } from "./teacher-list"

export function TeacherTabs() {
  return (
    <Tabs defaultValue="pending" className="space-y-4">
      <TabsList>
        <TabsTrigger value="pending">Pending</TabsTrigger>
        <TabsTrigger value="approved">Approved</TabsTrigger>
        <TabsTrigger value="rejected">Rejected</TabsTrigger>
      </TabsList>

      <TabsContent value="pending">
        <TeacherList status="pending" />
      </TabsContent>

      <TabsContent value="approved">
        <TeacherList status="verified" />
      </TabsContent>

      <TabsContent value="rejected">
        <TeacherList status="rejected" />
      </TabsContent>
    </Tabs>
  )
}
