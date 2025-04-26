import Link from "next/link"
import { notFound } from "next/navigation"
import { TeacherSignUpForm } from "@/components/auth/teacher-sign-up-form"
import { StudentSignUpForm } from "@/components/auth/student-sign-up-form"
import { ParentSignUpForm } from "@/components/auth/parent-sign-up-form"
import { Testimonials } from "@/components/auth/testimonials"
import { cn } from "@/lib/utils"
import { ArrowLeft } from "lucide-react"

export default function RoleSignUpPage({ params }: { params: { role: string } }) {
  const getFormComponent = () => {
    switch (params.role) {
      case "teacher":
        return <TeacherSignUpForm />
      case "student":
        return <StudentSignUpForm />
      case "parent":
        return <ParentSignUpForm />
      default:
        return notFound()
    }
  }

  return (
    <div className="flex min-h-screen">
      <Testimonials />
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center p-8 relative">
        <div className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center gap-2">
          <Link 
            href="/sign-up"
            className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Change Account Type
          </Link>
        </div>
        <Link 
          href="/sign-in" 
          className={cn("absolute right-4 top-4 md:right-8 md:top-8")}
        >
          Sign in
        </Link>
        {getFormComponent()}
      </div>
    </div>
  )
}
