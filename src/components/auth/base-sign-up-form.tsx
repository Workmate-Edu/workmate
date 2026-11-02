"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { FiEye, FiEyeOff, FiLoader } from "react-icons/fi"
import { cn } from "@/lib/utils"

interface BaseSignUpFormProps {
  register: any
  errors: any
  isSubmitting: boolean
}

export function BaseSignUpFields({ register, errors, isSubmitting }: BaseSignUpFormProps) {
  const [showPassword, setShowPassword] = React.useState(false)

  return (
    <>
      <div className={cn("space-y-2 rounded-lg border border-transparent p-3", errors.name && "border-destructive bg-destructive/5")}>
        <Label className={cn(errors.name && "text-destructive")}>Full Name</Label>
        <Input
          placeholder="Full Name"
          type="text"
          {...register("name")}
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.name)}
          className={cn(errors.name && "border-destructive focus-visible:ring-destructive")}
        />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div className={cn("space-y-2 rounded-lg border border-transparent p-3", errors.username && "border-destructive bg-destructive/5")}>
        <Label className={cn(errors.username && "text-destructive")}>Username</Label>
        <Input
          placeholder="Username"
          type="text"
          {...register("username")}
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.username)}
          className={cn(errors.username && "border-destructive focus-visible:ring-destructive")}
        />
        {errors.username && (
          <p className="text-sm text-red-600">{errors.username.message}</p>
        )}
      </div>

      <div className={cn("space-y-2 rounded-lg border border-transparent p-3", errors.email && "border-destructive bg-destructive/5")}>
        <Label className={cn(errors.email && "text-destructive")}>Email</Label>
        <Input
          placeholder="name@example.com"
          type="email"
          {...register("email")}
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.email)}
          className={cn(errors.email && "border-destructive focus-visible:ring-destructive")}
        />
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div className={cn("space-y-2 rounded-lg border border-transparent p-3", errors.password && "border-destructive bg-destructive/5")}>
        <Label className={cn(errors.password && "text-destructive")}>Password</Label>
        <div className="relative">
          <Input
            placeholder="Create password"
            type={showPassword ? "text" : "password"}
            {...register("password")}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.password)}
            className={cn(errors.password && "border-destructive focus-visible:ring-destructive")}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
          </Button>
        </div>
        {errors.password && (
          <p className="text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>
    </>
  )
}
