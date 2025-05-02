"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { School, Users, GraduationCap } from "lucide-react"
import type { UserRole } from "@/types/auth"

const userTypes = [
  {
    role: "student" as UserRole,
    title: "I'm a Student",
    description: "Find expert teachers and start your learning journey",
    icon: GraduationCap
  },
  {
    role: "parent" as UserRole,
    title: "I'm a Parent",
    description: "Manage your children's education and connect with teachers",
    icon: Users
  },
  {
    role: "teacher" as UserRole,
    title: "I'm a Teacher",
    description: "Create lessons, connect with students, and grow your teaching business",
    icon: School
  }
]

export function UserTypeSelector() {
  const router = useRouter()

  const handleSelect = (role: UserRole) => {
    router.push(`/sign-up/${role}`)
  }

  return (
    <div className="w-full max-w-3xl space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Join Workmate</h1>
        <p className="text-muted-foreground">Choose how you'll use Workmate</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {userTypes.map(({ role, title, description, icon: Icon }) => (
          <Card 
            key={role}
            className="p-6 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleSelect(role)}
          >
            <Icon className="w-10 h-10 mb-4 text-primary" />
            <h2 className="font-semibold mb-2">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
