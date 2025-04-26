"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const resetSchema = z.object({
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .regex(/^(?=.*[a-z])(?=.*[0-9])/, "Password must contain letters and numbers"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords must match",
  path: ["confirmPassword"],
})

type ResetFormData = z.infer<typeof resetSchema>

export default function ResetPasswordPage({ params }: { params: { childId: string } }) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      password: "",
      confirmPassword: ""
    },
    mode: "onChange"
  })

  const { register, handleSubmit, watch, formState, trigger } = form
  const password = watch("password")
  const confirmPassword = watch("confirmPassword")

  // 🔁 Revalidate confirmPassword when password changes
  useEffect(() => {
    if (confirmPassword) {
      trigger("confirmPassword")
    }
  }, [password, trigger, confirmPassword])

  const onSubmit = async (data: ResetFormData) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/parent/children/${params.childId}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: data.password })
      })

      if (!response.ok) {
        throw new Error("Failed to reset password")
      }

      toast.success("Password reset successfully")
      router.push(`/dashboard/parent/children/${params.childId}`)
    } catch (error) {
      toast.error("Failed to reset password")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-md py-8">
      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <h1 className="text-xl font-bold mb-4">Reset Child Password</h1>

          <div className="space-y-2">
            <Label>New Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className={formState.errors.password ? "border-red-500" : ""}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {formState.errors.password && (
              <p className="text-sm text-red-500">
                {formState.errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Confirm Password</Label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword")}
                className={confirmPassword && password !== confirmPassword ? "border-red-500" : ""}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {formState.errors.confirmPassword && (
              <p className="text-sm text-red-500">
                {formState.errors.confirmPassword.message}
              </p>
            )}
            {confirmPassword && !formState.errors.confirmPassword && (
              <p className={`text-sm ${password === confirmPassword ? "text-green-500" : "text-red-500"}`}>
                {password === confirmPassword ? "Passwords match" : "Passwords do not match"}
              </p>
            )}
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
