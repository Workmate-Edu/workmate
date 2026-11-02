"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardStats } from "@/components/admin/dashboard-stats"
import { Users, GraduationCap, ClipboardCheck, ArrowRight } from "lucide-react"
import { TeacherTabs } from "@/components/admin/teacher-tabs"
import { StudentTabs } from "@/components/admin/student-tabs"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { toast } from "sonner"

interface Student {
  id: string
  name: string
  status: string
  // ...other student properties
}

interface DashboardData {
  independent: Student[]
  children: Student[]
  loading: boolean
}

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    independent: [],
    children: [],
    loading: true
  })
  const [activeTab, setActiveTab] = useState<'students' | 'teachers'>('students')

  const fetchData = async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true }))
      
      const controller = new AbortController()
      const timeout = window.setTimeout(() => controller.abort(), 12_000)
      const studentsResponse = await fetch('/api/admin/students', { signal: controller.signal })
      window.clearTimeout(timeout)
      if (!studentsResponse.ok) {
        throw new Error('Failed to fetch students')
      }

      const studentsData = await studentsResponse.json()
      setDashboardData(prev => ({
        ...prev,
        independent: studentsData.independent || [],
        children: studentsData.children || [],
        loading: false
      }))

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error(error instanceof DOMException && error.name === 'AbortError' ? 'Student data is taking too long to load' : 'Failed to load dashboard data')
      setDashboardData(prev => ({ ...prev, loading: false }))
    }
  }

  useEffect(() => {
    fetchData();
  }, [])

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <DashboardStats />

      <Card className="mt-8 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-semibold text-lg">Assessments</h2><p className="text-sm text-muted-foreground">Review pending assessments from the dedicated queue.</p></div><Button variant="outline" asChild><Link href="/dashboard/admin/assessments">Review assessments <ArrowRight className="ml-2 h-4 w-4" /></Link></Button></Card>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'students' | 'teachers')} className="mt-8">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="students">
            <Users className="w-4 h-4 mr-2" />
            Students
          </TabsTrigger>
          <TabsTrigger value="teachers">
            <GraduationCap className="w-4 h-4 mr-2" />
            Teachers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students">
          <StudentTabs 
            independent={dashboardData.independent}
            children={dashboardData.children}
            isLoading={dashboardData.loading}
            showFilters={true}
          />
        </TabsContent>

        <TabsContent value="teachers">
          {activeTab === 'teachers' && <TeacherTabs />}
        </TabsContent>
      </Tabs>

      <Card className="mt-10 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-semibold">Subscriptions</h2><p className="text-sm text-muted-foreground">Open subscriptions only when you need to review or manage them.</p></div><Button variant="outline" asChild><Link href="/dashboard/admin/subscriptions"><ClipboardCheck className="mr-2 h-4 w-4" />Manage subscriptions</Link></Button></Card>
    </div>
  )
}
