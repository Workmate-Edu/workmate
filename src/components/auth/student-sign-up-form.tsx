"use client"

import * as React from "react"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { FiLoader } from "react-icons/fi"
import { Stepper } from "@/components/ui/stepper"
import { BasicInfoStep, EducationStep, SubjectsStep } from "./student-sign-up-steps"
import { educationLevels, gradesByLevel } from "@/lib/constants/education" // Add this import
import { genderOptions, ageGroups } from "@/lib/constants/general"
import { TermsAgreement } from "./terms-agreement"

const studentFormSchema = z.object({
  // ...base fields
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  // Student specific fields
  educationLevel: z.string().min(1, "Education level is required"),
  grade: z.string().min(1, "Grade/Year level is required"),
  subjectAreas: z.array(z.string())
    .min(1, "Select at least one subject area")
    .default([]),
  // subjects: z.array(z.string())
  //   .min(1, "Select at least one subject")
  //   .default([]),
    subjects: z.array(z.object({
      name: z.string(),
      area: z.string()
    }))
    .min(1, "Select at least one subject")
    .default([]),    
  gender: z.string().min(1, "Please select your gender"),
  ageGroup: z.string().min(1, "Please select your age group"),
})

const subjectAreas = [
  { 
    label: "STEM", 
    value: "stem",
    subjects: [
      { label: "Math", value: "math" },
      { label: "Physics", value: "physics" },
      { label: "Chemistry", value: "chemistry" },
      { label: "Biology", value: "biology" },
      { label: "Computer Science", value: "cs" },
    ]
  },
  {
    label: "Languages",
    value: "languages",
    subjects: [
      { label: "Hausa", value: "hausa" },
      { label: "Igbo", value: "igbo" },
      { label: "Yoruba", value: "yoruba" },
      { label: "Arabic", value: "arabic" },
      { label: "Swahili", value: "swahili" },
    ]
  }
]

export function StudentSignUpForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = React.useState(0)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [selectedAreas, setSelectedAreas] = React.useState<string[]>([])
  const [selectedSubjects, setSelectedSubjects] = React.useState<string[]>([])
  const [selectedLevel, setSelectedLevel] = React.useState<string>("")

  const form = useForm<z.infer<typeof studentFormSchema>>({
    resolver: zodResolver(studentFormSchema),
  })

  const availableSubjects = React.useMemo(() => {
    return selectedAreas.flatMap(area => {
      const foundArea = subjectAreas.find(a => a.value === area)
      return foundArea?.subjects || []
    })
  }, [selectedAreas])

  const availableGrades = React.useMemo(() => {
    if (!selectedLevel) return []
    return gradesByLevel[selectedLevel as keyof typeof gradesByLevel] || []
  }, [selectedLevel])

  const handleAreaToggle = (areaValue: string) => {
    setSelectedAreas(current => {
      const newAreas = current.includes(areaValue)
        ? current.filter(a => a !== areaValue)
        : [...current, areaValue];
      
      form.setValue("subjectAreas", newAreas, { shouldValidate: true });
      
      if (current.includes(areaValue)) {
        const area = subjectAreas.find(a => a.value === areaValue)
        const areaSubjects = area?.subjects.map(s => s.value) || []
        const newSubjects = selectedSubjects.filter(s => !areaSubjects.includes(s));
        setSelectedSubjects(newSubjects);
        form.setValue("subjects", newSubjects, { shouldValidate: true });
      }
      return newAreas;
    });
  }

  // const handleSubjectToggle = (subjectValue: string) => {
  //   setSelectedSubjects(current => {
  //     const newSubjects = current.includes(subjectValue)
  //       ? current.filter(s => s !== subjectValue)
  //       : [...current, subjectValue]; // Added missing ternary operator part
      
  //     // Update form value immediately
  //     form.setValue("subjects", newSubjects);
  //     return newSubjects;
  //   });
  // }

  const handleSubjectToggle = (subjectValue: string) => {
    setSelectedSubjects(current => {
      const newSubjects = current.includes(subjectValue)
        ? current.filter(s => s !== subjectValue)
        : [...current, subjectValue];
  
      const subjectObjects = newSubjects.map(subjectVal => {
        const foundArea = subjectAreas.find(area =>
          area.subjects.some(s => s.value === subjectVal)
        )
        const foundSubject = foundArea?.subjects.find(s => s.value === subjectVal)
        return {
          name: foundSubject?.value || subjectVal,
          area: foundArea?.value || "unknown"
        }
      })
  
      form.setValue("subjects", subjectObjects, { shouldValidate: true })
      return newSubjects;
    });
  }
  

  const handleNext = async () => {
    let isValid = false
    
    switch (currentStep) {
      case 0:
        isValid = await form.trigger(["name", "email", "password", "gender", "ageGroup"])
        break
      case 1:
        isValid = await form.trigger(["educationLevel", "grade"])
        break
      case 2:
        isValid = await form.trigger(["subjectAreas", "subjects"])
        if (isValid) {
          await handleSubmit()
          return
        }
        break
    }

    if (isValid) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => setCurrentStep((prev) => prev - 1)

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      const data = form.getValues()
      
      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, role: "student" }),
        // Generate subject objects with area and name
        // body: JSON.stringify({ ...data, role: "student", subjects: subjectObjects })
      })

      if (!response.ok) {
        throw new Error("Failed to create account")
      }

      toast.success("Account created! Please check your email for verification.")
      router.push(`/verify-pending?email=${encodeURIComponent(data.email)}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create account")
    } finally {
      setIsSubmitting(false)
    }
  }

  const steps = [
    "Basic Information",
    "Education Details",
    "Subject Selection"
  ]

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Create Student Account</h1>
        <p className="text-sm text-muted-foreground">
          Start your learning journey with Workmate
        </p>
      </div>

      <Stepper 
        steps={steps} 
        currentStep={currentStep}
        onStepClick={(step) => {
          if (step < currentStep) {
            setCurrentStep(step)
          }
        }}
      />

      <form className="space-y-6">
        {currentStep === 0 && (
          <BasicInfoStep 
            form={form}
            register={form.register}
            setValue={form.setValue}
            errors={form.formState.errors}
            isSubmitting={isSubmitting}
          />
        )}

        {currentStep === 1 && (
          <EducationStep 
            form={form}
            register={form.register}
            setValue={form.setValue}
            errors={form.formState.errors}
            isSubmitting={isSubmitting}
            selectedLevel={selectedLevel}
            setSelectedLevel={setSelectedLevel}
            availableGrades={availableGrades}
          />
        )}

        {currentStep === 2 && (
          <SubjectsStep 
            form={form}
            register={form.register}
            setValue={form.setValue}
            errors={form.formState.errors}
            isSubmitting={isSubmitting}
            selectedAreas={selectedAreas}
            setSelectedAreas={setSelectedAreas}
            selectedSubjects={selectedSubjects}
            setSelectedSubjects={setSelectedSubjects}
            availableSubjects={availableSubjects}
            handleAreaToggle={handleAreaToggle}
            handleSubjectToggle={handleSubjectToggle}
            subjectAreas={subjectAreas}
          />
        )}

        <TermsAgreement />

        <div className="flex justify-between pt-4">
          {currentStep > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={isSubmitting}
            >
              Back
            </Button>
          )}
          <Button
            type="button"
            className="ml-auto"
            onClick={handleNext}
            disabled={isSubmitting}
          >
            {currentStep === steps.length - 1 ? (
              isSubmitting ? (
                <>
                  <FiLoader className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )
            ) : (
              "Next"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
