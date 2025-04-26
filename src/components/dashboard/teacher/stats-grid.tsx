"use client"

import { Card } from "@/components/ui/card"
import { 
  FiUsers, 
  FiBook, 
  FiCheckSquare, 
  FiDollarSign,
  FiTrendingUp,
  FiClock
} from "react-icons/fi"

interface Stat {
  label: string
  value: string | number
  change?: number
  icon: React.ReactNode
  color: string
}

const stats: Stat[] = [
  {
    label: "Active Students",
    value: 42,
    change: 8,
    icon: <FiUsers className="h-5 w-5" />,
    color: "blue"
  },
  {
    label: "Upcoming Classes",
    value: 12,
    icon: <FiBook className="h-5 w-5" />,
    color: "green"
  },
  {
    label: "Pending Tasks",
    value: 7,
    icon: <FiCheckSquare className="h-5 w-5" />,
    color: "orange"
  },
  {
    label: "Monthly Earnings",
    value: "$2,450",
    change: 12,
    icon: <FiDollarSign className="h-5 w-5" />,
    color: "purple"
  }
]

export function StatsGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index} className="p-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 bg-${stat.color}-100 rounded-full`}>
              <div className={`text-${stat.color}-600`}>
                {stat.icon}
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </p>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold tracking-tight">
                  {stat.value}
                </h3>
                {stat.change && (
                  <span className={`flex items-center text-sm font-medium text-${stat.change >= 0 ? 'green' : 'red'}-600`}>
                    {stat.change >= 0 ? (
                      <FiTrendingUp className="mr-1 h-4 w-4" />
                    ) : (
                      <FiClock className="mr-1 h-4 w-4" />
                    )}
                    {Math.abs(stat.change)}%
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
