"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { TeacherProfileForm } from "@/components/forms/teacher-profile-form"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { ArrowLeft, Key, Eye, EyeOff, X } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const passwordChangeSchema = z
  .object({
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

type PasswordChangeData = z.infer<typeof passwordChangeSchema>

export default function TeacherProfilePage() {
  const searchParams = useSearchParams()
  const action = searchParams.get("action")

  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const passwordForm = useForm<PasswordChangeData>({
    resolver: zodResolver(passwordChangeSchema),
  })

  useEffect(() => {
    // Auto-trigger reapply if coming from rejection email
    if (action === "reapply") {
      toast.info(
        "You can now update your profile and reapply for verification",
        {
          duration: 5000,
        }
      )
    }
  }, [action])

  const onPasswordSubmit = async (data: PasswordChangeData) => {
    try {
      setIsChangingPassword(true)
      const response = await fetch("/api/teacher/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: data.newPassword }),
      })

      if (!response.ok) throw new Error("Failed to change password")

      toast.success("Password changed successfully")
      setShowPasswordModal(false)
    } catch (error) {
      toast.error("Failed to change password")
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <>
      <div className="container py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/dashboard/teacher">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Teacher Profile</h1>
          <Card className="p-6">
            <TeacherProfileForm />

            <div className="mt-6">
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
          </Card>
        </div>
      </div>

      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
            className="space-y-4"
          >
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
                <p className="text-sm text-red-600">
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
                <p className="text-sm text-red-600">
                  {passwordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowPasswordModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isChangingPassword}>
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
