"use client"

import { Button } from "@/components/ui/button"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { FiMail, FiPhone, FiMapPin, FiUser, FiCamera, FiEdit2 } from "react-icons/fi"
import Image from "next/image"
import { useThemeContext } from "@/hooks/use-theme-context"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const { theme } = useThemeContext()
  const router = useRouter()

  // Mock data - would come from API in real app
  const profile = {
    name: "John Doe Sr.",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, Anytown, ST 12345",
    bio: "Proud parent of two wonderful children. Active member of the school community and passionate about education.",
    avatar: "/placeholder-avatar.jpg",
    children: [
      {
        id: 1,
        name: "John Doe Jr.",
        grade: "10th Grade",
        age: 15,
        avatar: "/placeholder-child-1.jpg"
      },
      {
        id: 2,
        name: "Jane Doe",
        grade: "8th Grade",
        age: 13,
        avatar: "/placeholder-child-2.jpg"
      }
    ]
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className={`text-3xl font-bold tracking-tight ${theme.text.light}`}>Profile</h2>
          <Button className={theme.button.primary}>Save Changes</Button>
        </div>

        <div className="grid gap-6 md:grid-cols-6">
          <Card className={`col-span-4 p-6 ${theme.background.light}`}>
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24">
                    {profile.avatar ? (
                      <Avatar className="h-24 w-24">
                        <AvatarImage
                          src={profile.avatar}
                          alt={profile.name}
                        />
                        <AvatarFallback>
                          {profile.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <Avatar className="h-24 w-24">
                        <AvatarFallback>
                          {profile.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className={`absolute bottom-0 right-0 rounded-full ${theme.button.outline}`}
                  >
                    <FiCamera className="w-4 h-4" />
                  </Button>
                </div>
                <div>
                  <h3 className={`text-xl font-semibold ${theme.text.light}`}>{profile.name}</h3>
                  <p className="text-sm text-muted-foreground">Parent</p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className={`text-sm font-medium ${theme.text.light}`}>Full Name</Label>
                  <Input
                    id="name"
                    defaultValue={profile.name}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email" className={`text-sm font-medium ${theme.text.light}`}>Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={profile.email}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone" className={`text-sm font-medium ${theme.text.light}`}>Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    defaultValue={profile.phone}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="address" className={`text-sm font-medium ${theme.text.light}`}>Address</Label>
                  <Input
                    id="address"
                    defaultValue={profile.address}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="bio" className={`text-sm font-medium ${theme.text.light}`}>Bio</Label>
                  <Textarea
                    id="bio"
                    defaultValue={profile.bio}
                    rows={4}
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className={`col-span-2 p-6 ${theme.background.light}`}>
            <div className="space-y-6">
              <div>
                <h3 className={`text-lg font-semibold ${theme.text.light}`}>Children</h3>
                <p className="text-sm text-muted-foreground">Your registered children</p>
              </div>

              <div className="space-y-4">
                {profile.children.map((child) => (
                  <div
                    key={child.id}
                    className="flex items-center gap-4 p-4 rounded-lg border"
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                      <Image
                        src={child.avatar}
                        alt={child.name}
                        width={48}
                        height={48}
                      />
                    </div>
                    <div>
                      <h4 className={`font-medium ${theme.text.light}`}>{child.name}</h4>
                      <div className="flex gap-2 text-sm text-muted-foreground">
                        <span>{child.grade}</span>
                        <span>•</span>
                        <span>{child.age} years old</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                className={theme.button.outline}
                onClick={() => router.push('/dashboard/parent/children/add')}
              >
                Add Child
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
