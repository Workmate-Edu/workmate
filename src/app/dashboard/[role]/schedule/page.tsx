"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ScheduleCalendar } from "@/components/calendar/schedule-calendar"
import { FiBook, FiCalendar, FiClock, FiUser } from "react-icons/fi"

export default function SchedulePage() {
  // Mock data - would come from API in real app
  const schedule = {
    today: [
      {
        id: 1,
        title: "Advanced Mathematics",
        time: "14:00 - 15:30",
        teacher: "Dr. Sarah Johnson",
        child: "John Doe Jr.",
        room: "Room 101",
        type: "class",
      },
      {
        id: 2,
        title: "Parent-Teacher Meeting",
        time: "16:00 - 16:30",
        teacher: "Ms. Emily Brown",
        child: "Jane Doe",
        room: "Staff Room",
        type: "meeting",
      },
    ],
    upcoming: [
      {
        id: 3,
        title: "Physics",
        time: "10:00 - 11:30",
        teacher: "Mr. Robert Smith",
        child: "John Doe Jr.",
        room: "Room 203",
        date: "Tomorrow",
        type: "class",
      },
      {
        id: 4,
        title: "Biology Lab",
        time: "13:00 - 14:30",
        teacher: "Dr. Michael Green",
        child: "Jane Doe",
        room: "Lab 2",
        date: "Feb 21, 2024",
        type: "lab",
      },
      {
        id: 5,
        title: "School Concert",
        time: "18:00 - 20:00",
        child: "Both",
        room: "Auditorium",
        date: "Mar 1, 2024",
        type: "event",
      },
    ],
  }

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight">Schedule</h2>
          <div className="flex gap-2">
            <Button variant="outline">
              <FiCalendar className="w-4 h-4 mr-2" />
              Sync Calendar
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <FiClock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-medium">Today's Events</h3>
                <p className="text-2xl font-bold">{schedule.today.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <FiUser className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-medium">Office Hours</h3>
                <p className="text-2xl font-bold">2</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <FiBook className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-medium">Classes</h3>
                <p className="text-2xl font-bold">{schedule.today.filter(event => event.type === 'class').length + schedule.upcoming.filter(event => event.type === 'class').length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <FiCalendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-medium">Total Events</h3>
                <p className="text-2xl font-bold">{schedule.today.length + schedule.upcoming.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Calendar */}
        <ScheduleCalendar />
      </div>
    </DashboardLayout>
  )
}
