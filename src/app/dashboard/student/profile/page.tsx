"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Pencil, Save, X, Key, Eye, EyeOff } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const studentProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  studentProfile: z.object({
    grade: z.string().min(1, "Education level is required"),
  })
})

const passwordChangeSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type StudentProfileData = z.infer<typeof studentProfileSchema>
type PasswordChangeData = z.infer<typeof passwordChangeSchema>

export default function StudentProfile() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const form = useForm<StudentProfileData>({
    resolver: zodResolver(studentProfileSchema),
  })

  const passwordForm = useForm<PasswordChangeData>({
    resolver: zodResolver(passwordChangeSchema)
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/student/profile')
      const data = await response.json()
      
      if (response.ok) {
        console.log('Fetched data:', data) // For debugging
        form.reset({
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          studentProfile: {
            grade: data.studentProfile?.grade || ''
          }
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast.error("Failed to load profile")
    } finally {
      setIsLoading(false)
    }
  }

  // Reset form when canceling edit mode
  const handleCancelEdit = () => {
    setIsEditing(false)
    form.reset() // Reset to last saved values
  }

  const onSubmit = async (data: StudentProfileData) => {
    try {
      const response = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) throw new Error("Update failed")
      
      await fetchProfile()
      setIsEditing(false)
      toast.success("Profile updated successfully")
    } catch (error) {
      toast.error("Failed to update profile")
    }
  }

  const onPasswordSubmit = async (data: PasswordChangeData) => {
    try {
      setIsChangingPassword(true)
      const response = await fetch('/api/student/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: data.newPassword })
      })

      if (!response.ok) throw new Error("Failed to change password")

      toast.success("Password changed successfully")
      setShowPasswordModal(false)
      passwordForm.reset()
    } catch (error) {
      toast.error("Failed to change password")
    } finally {
      setIsChangingPassword(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <Card className="p-6">
          <div className="h-[400px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <>
      <div className="container py-8">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Student Profile</h2>
            <Button
              variant={isEditing ? "ghost" : "default"}
              onClick={isEditing ? handleCancelEdit : () => setIsEditing(true)}
              size="sm"
            >
              {isEditing ? (
                <X className="h-4 w-4 mr-2" />
              ) : (
                <Pencil className="h-4 w-4 mr-2" />
              )}
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input {...form.register("name")} disabled={!isEditing} />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input {...form.register("email")} disabled={true} />
              </div>

              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input {...form.register("phone")} disabled={!isEditing} />
                {form.formState.errors.phone && (
                  <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Education Level</Label>
                <Select
                  disabled={!isEditing}
                  onValueChange={(value) => form.setValue("studentProfile.grade", value)}
                  value={form.watch("studentProfile.grade")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your education level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Primary School</SelectItem>
                    <SelectItem value="secondary">Secondary School</SelectItem>
                    <SelectItem value="high_school">High School</SelectItem>
                    <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                    <SelectItem value="masters">Master's Degree</SelectItem>
                    <SelectItem value="phd">PhD</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.studentProfile?.grade && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.studentProfile.grade.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Password</Label>
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowPasswordModal(true)}
                >
                  <Key className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              {isEditing && (
                <Button
                  type="submit"
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              )}
            </div>
          </form>
        </Card>
      </div>

      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>New Password</Label>
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  {...passwordForm.register("newPassword")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {passwordForm.formState.errors.newPassword && (
                <p className="text-sm text-destructive">
                  {passwordForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Confirm Password</Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  {...passwordForm.register("confirmPassword")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {passwordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowPasswordModal(false)
                  passwordForm.reset()
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isChangingPassword}
              >
                {isChangingPassword ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  "Save Password"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
