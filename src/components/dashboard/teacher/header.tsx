"use client"

import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { 
  FiBell, 
  FiCalendar, 
  FiMessageSquare, 
  FiPlus 
} from "react-icons/fi"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export function TeacherHeader() {
  const { data: session } = useSession()

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Welcome back, {session?.user?.name}</h1>
          <p className="text-sm text-muted-foreground">
            Manage your classes, students, and schedule
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <FiCalendar className="h-5 w-5" />
          </Button>
          
          {/* Messages */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <FiMessageSquare className="h-5 w-5" />
                <Badge 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center"
                  variant="destructive"
                >
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[300px]">
              <DropdownMenuLabel>Recent Messages</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <div className="flex flex-col gap-1">
                  <span className="font-medium">Sarah's Parent</span>
                  <span className="text-sm text-muted-foreground">Question about homework...</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex flex-col gap-1">
                  <span className="font-medium">John's Parent</span>
                  <span className="text-sm text-muted-foreground">Regarding next week's test...</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <FiBell className="h-5 w-5" />
                <Badge 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center"
                  variant="destructive"
                >
                  2
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[300px]">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <div className="flex flex-col gap-1">
                  <span className="font-medium">New Assignment Submission</span>
                  <span className="text-sm text-muted-foreground">Math Quiz - Sarah Johnson</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex flex-col gap-1">
                  <span className="font-medium">Class Starting Soon</span>
                  <span className="text-sm text-muted-foreground">Advanced Algebra in 30 minutes</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Create New Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <FiPlus className="h-5 w-5 mr-1" />
                Create New
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Schedule Class</DropdownMenuItem>
              <DropdownMenuItem>Create Assignment</DropdownMenuItem>
              <DropdownMenuItem>Add Student</DropdownMenuItem>
              <DropdownMenuItem>Create Announcement</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarImage src={session?.user?.image || ""} />
                  <AvatarFallback>
                    {session?.user?.name?.charAt(0) || "T"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Earnings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
