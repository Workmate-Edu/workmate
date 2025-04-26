"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  FiFileText, 
  FiClock,
  FiCheck,
  FiX,
  FiChevronRight
} from "react-icons/fi"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

interface Submission {
  id: number
  student: {
    name: string
    avatar?: string
  }
  assignment: string
  subject: string
  submittedAt: string
  status: "pending" | "graded" | "late"
}

const recentSubmissions: Submission[] = [
  {
    id: 1,
    student: {
      name: "Sarah Johnson",
      avatar: "/avatars/sarah.jpg"
    },
    assignment: "Math Quiz 3",
    subject: "Mathematics",
    submittedAt: "2 hours ago",
    status: "pending"
  },
  {
    id: 2,
    student: {
      name: "Michael Brown",
      avatar: "/avatars/michael.jpg"
    },
    assignment: "Physics Lab Report",
    subject: "Physics",
    submittedAt: "5 hours ago",
    status: "late"
  },
  {
    id: 3,
    student: {
      name: "Emily Davis",
      avatar: "/avatars/emily.jpg"
    },
    assignment: "Chemistry Homework",
    subject: "Chemistry",
    submittedAt: "1 day ago",
    status: "graded"
  }
]

export function StudentActivity() {
  return (
    <Card className="p-6">
      <Tabs defaultValue="submissions">
        <div className="flex items-center justify-between mb-6">
          <TabsList>
            <TabsTrigger value="submissions">Recent Submissions</TabsTrigger>
            <TabsTrigger value="pending">Pending Grading</TabsTrigger>
            <TabsTrigger value="progress">Student Progress</TabsTrigger>
          </TabsList>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </div>

        <TabsContent value="submissions" className="space-y-4">
          {recentSubmissions.map((submission) => (
            <div
              key={submission.id}
              className="flex items-center justify-between p-4 rounded-lg border"
            >
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={submission.student.avatar} />
                  <AvatarFallback>
                    {submission.student.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{submission.student.name}</h3>
                    <Badge 
                      variant={
                        submission.status === "pending" 
                          ? "default"
                          : submission.status === "graded"
                          ? "success"
                          : "destructive"
                      }
                      className="flex items-center gap-1"
                    >
                      {submission.status === "pending" && <FiClock className="h-3 w-3" />}
                      {submission.status === "graded" && <FiCheck className="h-3 w-3" />}
                      {submission.status === "late" && <FiX className="h-3 w-3" />}
                      {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <FiFileText className="h-4 w-4" />
                      {submission.assignment}
                    </span>
                    <span>•</span>
                    <span>{submission.subject}</span>
                    <span>•</span>
                    <span>{submission.submittedAt}</span>
                  </div>
                </div>
              </div>

              <Button variant="ghost" size="sm" className="gap-2">
                View
                <FiChevronRight className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="pending">
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <FiFileText className="h-12 w-12 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Pending Assignments</h3>
            <p>All submitted assignments have been graded.</p>
          </div>
        </TabsContent>

        <TabsContent value="progress">
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <FiClock className="h-12 w-12 mb-4" />
            <h3 className="text-lg font-medium mb-2">Progress Report Coming Soon</h3>
            <p>We're preparing detailed progress reports for your students.</p>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
