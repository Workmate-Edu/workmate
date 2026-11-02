"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TeacherList } from "./teacher-list"

export function TeacherTabs() {
  const [status, setStatus] = useState('pending')
  return (
    <Tabs value={status} onValueChange={setStatus} className="space-y-4">
      <TabsList>
        <TabsTrigger value="pending">Pending</TabsTrigger>
        <TabsTrigger value="approved">Approved</TabsTrigger>
        <TabsTrigger value="rejected">Rejected</TabsTrigger>
      </TabsList>

      <TabsContent value="pending">
        {status === 'pending' && <TeacherList status="pending" />}
      </TabsContent>

      <TabsContent value="approved">
        {status === 'approved' && <TeacherList status="verified" />}
      </TabsContent>

      <TabsContent value="rejected">
        {status === 'rejected' && <TeacherList status="rejected" />}
      </TabsContent>
    </Tabs>
  )
}

