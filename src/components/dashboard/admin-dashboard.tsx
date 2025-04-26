"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FiBook, FiCalendar, FiMessageCircle, FiUsers } from "react-icons/fi"

export function AdminDashboard() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Quick Stats */}
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <FiBook className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Classes</p>
              <h3 className="text-2xl font-bold">24</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-full">
              <FiUsers className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Students</p>
              <h3 className="text-2xl font-bold">156</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <FiCalendar className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Upcoming Sessions</p>
              <h3 className="text-2xl font-bold">8</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-orange-100 rounded-full">
              <FiMessageCircle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Messages</p>
              <h3 className="text-2xl font-bold">12</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">New Teacher Registration</p>
                <p className="text-sm text-muted-foreground">John Smith - Math</p>
              </div>
              <Button variant="outline">Review</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Class Schedule Update</p>
                <p className="text-sm text-muted-foreground">Physics 101 - Time Changed</p>
              </div>
              <Button variant="outline">View Details</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">New Support Ticket</p>
                <p className="text-sm text-muted-foreground">Technical Issue Report</p>
              </div>
              <Button variant="outline">Handle</Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button className="w-full">Add New User</Button>
          <Button className="w-full" variant="outline">View Reports</Button>
          <Button className="w-full" variant="outline">System Settings</Button>
        </div>
      </div>
    </div>
  )
}
