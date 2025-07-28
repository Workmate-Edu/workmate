"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PendingAssessments } from "@/components/admin/pending-assessments"
import { TeacherVerifications } from "@/components/admin/teacher-verifications"
import { DashboardStats } from "@/components/admin/dashboard-stats"
import { Users, GraduationCap, ClipboardCheck, ArrowRight } from "lucide-react"
import { TeacherTabs } from "@/components/admin/teacher-tabs"
import { StudentTabs } from "@/components/admin/student-tabs"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

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
  const [pendingAssessments, setPendingAssessments] = useState<{
    initial: any[]
    child: any[]
  }>({ initial: [], child: [] })
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [subsLoading, setSubsLoading] = useState(true)

  const fetchData = async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true }))
      
      const studentsResponse = await fetch('/api/admin/students')
      if (!studentsResponse.ok) {
        throw new Error('Failed to fetch students')
      }

      const studentsData = await studentsResponse.json()
      console.log('Fetched students data:', studentsData) // Debug log

      setDashboardData(prev => ({
        ...prev,
        independent: studentsData.independent || [],
        children: studentsData.children || [],
        loading: false
      }))

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
      setDashboardData(prev => ({ ...prev, loading: false }))
    }
  }

  const fetchPendingAssessments = async () => {
    try {
      const response = await fetch("/api/admin/assessments");
      if (!response.ok) throw new Error("Failed to fetch assessments");
      const data = await response.json();
      setPendingAssessments(data.assessments || { initial: [], child: [] });
    } catch (err) {
      console.error("Error fetching assessments", err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchPendingAssessments();

    // Fetch subscriptions for admin
    fetch("/api/admin/subscriptions")
      .then(res => res.json())
      .then(data => setSubscriptions(data.subscriptions || []))
      .finally(() => setSubsLoading(false))
  }, [])

  if (dashboardData.loading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <div className="animate-pulse">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg" />
            ))}
          </div>
          <div className="h-96 bg-muted rounded-lg" />
        </div>
      </div>
    )
  }

  const activeIndependentCount = dashboardData.independent?.filter(s => s.status === 'active')?.length || 0
  const activeChildrenCount = dashboardData.children?.filter(s => s.status === 'active')?.length || 0
  const totalStudents = (dashboardData.independent?.length || 0) + (dashboardData.children?.length || 0)

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <DashboardStats 
        studentsCount={{
          total: totalStudents,
          active: activeIndependentCount + activeChildrenCount
        }}
      />

      {/* Show pending assessments summary if any exist */}
      {(pendingAssessments?.initial?.length > 0 || pendingAssessments?.child?.length > 0) && (
        <Card className="mt-8 p-4 border-warning">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-semibold text-lg">Pending Assessments</h2>
              <p className="text-sm text-muted-foreground">
                {pendingAssessments.initial.length} initial, {pendingAssessments.child.length} child assessments need review
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/dashboard/admin/assessments">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Card>
      )}

      <Tabs defaultValue="students" className="mt-8">
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
          <TeacherTabs />
        </TabsContent>
      </Tabs>

      {/* Subscription List Section */}
      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">All Subscriptions</h2>
        {subsLoading ? (
          <div className="p-8 text-center">Loading subscriptions...</div>
        ) : subscriptions.length === 0 ? (
          <Card className="p-8 text-center">No subscriptions found.</Card>
        ) : (
          <div className="space-y-4">
            {subscriptions.map(sub => (
              <Card key={sub._id} className="p-4 flex flex-col gap-2">
                <div className="flex flex-wrap gap-4 items-center">
                  <span className="font-semibold capitalize">{sub.userId?.name || "Unknown User"}</span>
                  <span className="text-xs text-muted-foreground">{sub.userId?.email}</span>
                  <Badge variant={sub.status === "active" ? "default" : "secondary"}>
                    {sub.status}
                  </Badge>
                  <span className="text-xs">Plan: {sub.plan}</span>
                  <span className="text-xs">
                    {new Date(sub.startDate).toLocaleDateString()} - {new Date(sub.endDate).toLocaleDateString()}
                  </span>
                  <span className="text-xs">Children: {sub.children?.length || 0}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Subjects: {Array.isArray(sub.subjects) ? sub.subjects.map((s: any) => s.subject).join(", ") : ""}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
