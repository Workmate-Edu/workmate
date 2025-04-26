"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { FileText, Users, Award, CheckCircle } from "lucide-react"

export function DashboardStats() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch('/api/admin/dashboard/stats')
        
        if (!response.ok) {
          throw new Error('Failed to fetch stats')
        }
        
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="p-6 animate-pulse">
          <div className="h-4 bg-muted rounded w-20 mb-2" />
          <div className="h-8 bg-muted rounded w-16" />
        </Card>
      ))}
    </div>
  }


  const statCards = [
    {
      title: "Pending Assessments",
      value: stats?.assessments?.total || 0,
      icon: FileText,
      details: `${stats?.assessments?.initial || 0} initial, ${stats?.assessments?.child || 0} child`,
    },
    {
      title: "Total Students",
      value: stats?.students?.total || 0,
      icon: Users,
      details: `${stats?.students?.active || 0} active • ${stats?.students?.independent?.total || 0} independent, ${stats?.students?.children?.total || 0} children`,
    },
    {
      title: "Total Teachers",
      value: stats?.teachers?.total || 0,
      icon: Award,
      details: `${stats?.teachers?.active || 0} active`,
    },
    {
      title: "Pending Verifications",
      value: stats?.teachers?.pending || 0, // ✅ fixed here
      icon: CheckCircle,
      details: "Teacher approvals"
    }
  ]
  

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => (
        <Card key={index} className="p-6">
          <div className="flex items-center gap-4">
            <stat.icon className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <h3 className="text-2xl font-bold">{stat.value}</h3>
              <p className="text-xs text-muted-foreground mt-1">{stat.details}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
