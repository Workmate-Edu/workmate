"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FiMail, FiUser, FiLoader } from "react-icons/fi"
import { RiShieldCheckLine } from "react-icons/ri"
import { LuGraduationCap } from "react-icons/lu"
import { useState } from "react"
import { toast } from "sonner"

const verificationContent = {
  student: {
    title: "Verify Your Email",
    description: "We've sent a verification email to your inbox. Please verify your email to start learning.",
    steps: [
      {
        icon: <FiMail className="h-6 w-6" />,
        title: "Check Your Email",
        description: "Click the verification link sent to your email"
      },
      {
        icon: <LuGraduationCap className="h-6 w-6" />,
        title: "Start Learning",
        description: "Access your account and begin learning"
      }
    ],
    extra: "While waiting, you can explore available courses and teachers.",
    link: { text: "Browse Courses", href: "/courses" }
  },
  teacher: {
    title: "Email Verification Required",
    description: "We've sent a verification email to your inbox. After verifying your email, our admin team will review your application.",
    steps: [
      {
        icon: <FiMail className="h-6 w-6" />,
        title: "Verify Email",
        description: "Click the verification link in your email"
      },
      {
        icon: <RiShieldCheckLine className="h-6 w-6" />,
        title: "Admin Review",
        description: "Wait for admin verification (1-2 business days)"
      }
    ],
    extra: "While waiting for admin verification, you can prepare your teaching materials and review our guidelines.",
    link: { text: "View Teaching Guidelines", href: "/teacher/guidelines" }
  },
  parent: {
    title: "Verify Your Email",
    description: "We've sent a verification email to your inbox. Please verify your email to access your account.",
    steps: [
      {
        icon: <FiMail className="h-6 w-6" />,
        title: "Check Your Email",
        description: "Click the verification link sent to your email"
      },
      {
        icon: <FiUser className="h-6 w-6" />,
        title: "Access Account",
        description: "Start managing your child's education"
      }
    ],
    extra: "While waiting, you can explore our parent resources and guides.",
    link: { text: "Parent Resources", href: "/parent/resources" }
  }
}

export default function VerifyEmailPage({ 
  searchParams 
}: { 
  searchParams: { role?: string; email?: string } 
}) {
  const [isResending, setIsResending] = useState(false)
  
  const handleResendVerification = async () => {
    if (!searchParams.email) return
    
    try {
      setIsResending(true)
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: searchParams.email,
          role: searchParams.role 
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to resend verification email")
      }

      toast.success("Verification email resent successfully!")
    } catch (error) {
      toast.error("Failed to resend verification email")
    } finally {
      setIsResending(false)
    }
  }

  const role = searchParams.role as keyof typeof verificationContent || 'student'
  const email = searchParams.email
  const content = verificationContent[role]

  return (
    <div className="container max-w-lg mx-auto py-8 px-4">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-semibold">{content.title}</h1>
        <p className="text-muted-foreground">
          {content.description}
          {email && <span className="font-medium block mt-1">{email}</span>}
        </p>
        
        <div className="mt-8 space-y-6">
          <div className="grid gap-6">
            {content.steps.map((step, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg text-primary">
                  {step.icon}
                </div>
                <div className="text-left">
                  <h3 className="font-medium">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm">{content.extra}</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleResendVerification}
            disabled={isResending}
          >
            {isResending ? (
              <>
                <FiLoader className="mr-2 h-4 w-4 animate-spin" />
                Resending verification...
              </>
            ) : (
              "Resend Verification Email"
            )}
          </Button>

          <Button asChild variant="link">
            <Link href={content.link.href}>
              {content.link.text}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
