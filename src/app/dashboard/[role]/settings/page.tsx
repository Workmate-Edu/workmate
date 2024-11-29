"use client"

import { Button } from "@/components/ui/button"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FiBell, FiGlobe, FiLock, FiMoon, FiShield } from "react-icons/fi"

export default function SettingsPage() {
  return (
    <DashboardLayout>
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <Button>Save Changes</Button>
      </div>

      <div className="grid gap-6">
        {/* Notifications */}
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <FiBell className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Notifications</h3>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Receive email notifications about your children's activities
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Receive push notifications on your device
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Assignment Updates</Label>
                  <p className="text-sm text-gray-500">
                    Get notified about new assignments and due dates
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Grade Updates</Label>
                  <p className="text-sm text-gray-500">
                    Receive notifications when grades are posted
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
        </Card>

        {/* Appearance */}
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <FiMoon className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Appearance</h3>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Theme</Label>
                  <p className="text-sm text-gray-500">
                    Select your preferred theme
                  </p>
                </div>
                <Select defaultValue="system">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Reduce Animations</Label>
                  <p className="text-sm text-gray-500">
                    Minimize motion in the interface
                  </p>
                </div>
                <Switch />
              </div>
            </div>
          </div>
        </Card>

        {/* Language */}
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <FiGlobe className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Language & Region</h3>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Language</Label>
                  <p className="text-sm text-gray-500">
                    Select your preferred language
                  </p>
                </div>
                <Select defaultValue="en">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Time Zone</Label>
                  <p className="text-sm text-gray-500">
                    Set your local time zone
                  </p>
                </div>
                <Select defaultValue="utc">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utc">UTC</SelectItem>
                    <SelectItem value="est">EST</SelectItem>
                    <SelectItem value="pst">PST</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Privacy & Security */}
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <FiShield className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Privacy & Security</h3>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-500">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Button variant="outline">Enable</Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Activity Log</Label>
                  <p className="text-sm text-gray-500">
                    View your account activity history
                  </p>
                </div>
                <Button variant="outline">View Log</Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Data Privacy</Label>
                  <p className="text-sm text-gray-500">
                    Manage how your data is used and shared
                  </p>
                </div>
                <Button variant="outline">Manage</Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
    </DashboardLayout>
  )
}
