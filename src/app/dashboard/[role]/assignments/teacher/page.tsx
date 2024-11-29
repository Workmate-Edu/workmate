"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FiPlus, FiCheck, FiClock, FiCalendar, FiUsers } from "react-icons/fi"

export default function TeacherAssignmentsPage() {
  const [isCreating, setIsCreating] = useState(false)

  const mockAssignments = [
    {
      id: 1,
      title: "Advanced Algebra Quiz",
      subject: "Mathematics",
      dueDate: "2024-02-25",
      status: "active",
      submissions: 15,
      totalStudents: 25,
    },
    {
      id: 2,
      title: "Lab Report: Forces and Motion",
      subject: "Physics",
      dueDate: "2024-02-23",
      status: "draft",
      submissions: 0,
      totalStudents: 20,
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight">Assignments</h2>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button>
                <FiPlus className="w-4 h-4 mr-2" />
                Create Assignment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Assignment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input placeholder="Assignment title" />
                </div>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="math">Mathematics</SelectItem>
                      <SelectItem value="physics">Physics</SelectItem>
                      <SelectItem value="chemistry">Chemistry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea placeholder="Assignment description and instructions" />
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input type="date" />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreating(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsCreating(false)}>
                    Create Assignment
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <FiClock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-medium">Active Assignments</h3>
                <p className="text-2xl font-bold">5</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <FiCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-medium">Pending Review</h3>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <FiCalendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-medium">Due This Week</h3>
                <p className="text-2xl font-bold">3</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Assignments List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Recent Assignments</h3>
            <Button variant="outline" size="sm">View All</Button>
          </div>
          <div className="grid gap-4">
            {mockAssignments.map((assignment) => (
              <Card key={assignment.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">{assignment.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {assignment.subject} • Due {assignment.dueDate}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <FiUsers className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {assignment.submissions}/{assignment.totalStudents}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">Submissions</span>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
