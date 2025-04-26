"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  FiClock, 
  FiUsers, 
  FiVideo,
  FiChevronRight 
} from "react-icons/fi"
import { Badge } from "@/components/ui/badge"

interface Class {
  id: number
  subject: string
  time: string
  duration: string
  students: number
  isOnline: boolean
  status: "upcoming" | "live" | "completed"
}

const todayClasses: Class[] = [
  {
    id: 1,
    subject: "Advanced Mathematics",
    time: "09:00 AM",
    duration: "1h 30m",
    students: 25,
    isOnline: true,
    status: "upcoming"
  },
  {
    id: 2,
    subject: "Physics 101",
    time: "11:00 AM",
    duration: "1h",
    students: 18,
    isOnline: true,
    status: "live"
  },
  {
    id: 3,
    subject: "Chemistry Lab",
    time: "02:00 PM",
    duration: "2h",
    students: 15,
    isOnline: false,
    status: "upcoming"
  }
]

export function TodaySchedule() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Today's Schedule</h2>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </div>

      <div className="space-y-4">
        {todayClasses.map((classItem) => (
          <div
            key={classItem.id}
            className="flex items-center justify-between p-4 rounded-lg border"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-full">
                <FiClock className="h-5 w-5 text-blue-600" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{classItem.subject}</h3>
                  {classItem.isOnline && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <FiVideo className="h-3 w-3" />
                      Online
                    </Badge>
                  )}
                  {classItem.status === "live" && (
                    <Badge variant="destructive">Live Now</Badge>
                  )}
                </div>

                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                  <span>{classItem.time}</span>
                  <span>•</span>
                  <span>{classItem.duration}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <FiUsers className="h-4 w-4" />
                    {classItem.students} students
                  </span>
                </div>
              </div>
            </div>

            <Button 
              variant={classItem.status === "live" ? "default" : "outline"}
              size="sm"
              className="gap-2"
            >
              {classItem.status === "live" ? "Join Now" : "View Details"}
              <FiChevronRight className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  )
}
