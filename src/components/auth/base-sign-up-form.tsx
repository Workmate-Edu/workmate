"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { FiEye, FiEyeOff, FiLoader } from "react-icons/fi"

interface BaseSignUpFormProps {
  register: any
  errors: any
  isSubmitting: boolean
}

export function BaseSignUpFields({ register, errors, isSubmitting }: BaseSignUpFormProps) {
  const [showPassword, setShowPassword] = React.useState(false)

  return (
    <>
      <div className="space-y-2">
        <Label>Full Name</Label>
        <Input
          placeholder="Full Name"
          type="text"
          {...register("name")}
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Username</Label>
        <Input
          placeholder="Username"
          type="text"
          {...register("username")}
          disabled={isSubmitting}
        />
        {errors.username && (
          <p className="text-sm text-red-600">{errors.username.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Email</Label>
        <Input
          placeholder="name@example.com"
          type="email"
          {...register("email")}
          disabled={isSubmitting}
        />
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Password</Label>
        <div className="relative">
          <Input
            placeholder="Create password"
            type={showPassword ? "text" : "password"}
            {...register("password")}
            disabled={isSubmitting}
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
