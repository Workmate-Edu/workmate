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
import { useSession } from "next-auth/react"

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
  const { data: session } = useSession()
  const [accountDetails, setAccountDetails] = useState({
    bankName: "",
    accountNumber: "",
    accountName: "",
    bvn: "",
  })
  const [savingAccount, setSavingAccount] = useState(false)

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

  useEffect(() => {
    // Fetch teacher account details if available
    async function fetchAccountDetails() {
      if (!session?.user?.id) return
      const res = await fetch(`/api/teacher/profile`)
      if (res.ok) {
        const data = await res.json()
        if (data?.teacherProfile?.accountDetails) {
          setAccountDetails({
            bankName: data.teacherProfile.accountDetails.bankName || "",
            accountNumber: data.teacherProfile.accountDetails.accountNumber || "",
            accountName: data.teacherProfile.accountDetails.accountName || "",
            bvn: data.teacherProfile.accountDetails.bvn || "",
          })
        }
      }
    }
    fetchAccountDetails()
  }, [session?.user?.id])

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

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAccountDetails({ ...accountDetails, [e.target.name]: e.target.value })
  }

  const handleAccountSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingAccount(true)
    try {
      const res = await fetch("/api/teacher/profile/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(accountDetails),
      })
      if (res.ok) {
        toast.success("Account details updated")
      } else {
        toast.error("Failed to update account details")
      }
    } catch {
      toast.error("Failed to update account details")
    } finally {
      setSavingAccount(false)
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
            {/* Account Details Section */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4">Account Details</h2>
              <form
                onSubmit={handleAccountSave}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div>
                  <Label>Bank Name</Label>
                  <Input
                    name="bankName"
                    value={accountDetails.bankName}
                    onChange={handleAccountChange}
                    placeholder="e.g. Access Bank"
                    required
                  />
                </div>
                <div>
                  <Label>Account Number</Label>
                  <Input
                    name="accountNumber"
                    value={accountDetails.accountNumber}
                    onChange={handleAccountChange}
                    placeholder="e.g. 0123456789"
                    required
                  />
                </div>
                <div>
                  <Label>Account Name</Label>
                  <Input
                    name="accountName"
                    value={accountDetails.accountName}
                    onChange={handleAccountChange}
                    placeholder="e.g. John Doe"
                    required
                  />
                </div>
                <div>
                  <Label>BVN</Label>
                  <Input
                    name="bvn"
                    value={accountDetails.bvn}
                    onChange={handleAccountChange}
                    placeholder="e.g. 12345678901"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end mt-2">
                  <Button type="submit" disabled={savingAccount}>
                    {savingAccount
                      ? "Saving..."
                      : "Save Account Details"}
                  </Button>
                </div>
              </form>
            </div>

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
