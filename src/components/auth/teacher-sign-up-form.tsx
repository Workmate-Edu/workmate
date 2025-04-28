"use client"

import * as React from "react"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { signIn } from "next-auth/react"
import { BaseSignUpFields } from "./base-sign-up-form"
import { Button } from "@/components/ui/button"
import { FiLoader } from "react-icons/fi"
import { genderOptions } from "@/lib/constants/general"
import { X } from "lucide-react"
import { BasicInfoStep, SubjectsStep, QualificationsStep } from "./teacher-sign-up-steps"
import { Stepper } from "@/components/ui/stepper"
import { TermsAgreement } from "./terms-agreement"

const teacherFormSchema = z.object({
  name: z.string().min(2),
  username: z.string().min(3, "Username must be at least 3 characters"), // Add username
  email: z.string().email(),
  password: z.string().min(8),
  gender: z.string().min(1, "Please select your gender"),
  subjectAreas: z.array(z.string()).min(1, "Select at least one subject area"),
  subjects: z.array(z.object({
    area: z.string(),
    subjects: z.array(z.string()).min(1)
  })).min(1, "Select subjects for each area"),
  experience: z.string().min(1, "Years of experience required"),
  education: z.string().min(1, "Education qualification required"),
  bio: z.string().min(20, "Bio should be at least 20 characters"),
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

const qualifications = [
  { label: "Certificate in Education", value: "cert_edu" },
  { label: "Diploma in Education", value: "dip_edu" },
  { label: "Bachelor's Degree", value: "bachelor" },
  { label: "Master's Degree", value: "master" },
  { label: "PhD", value: "phd" },
]

export function TeacherSignUpForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = React.useState(0)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [selectedAreas, setSelectedAreas] = React.useState<string[]>([])
  const [subjectsByArea, setSubjectsByArea] = React.useState<Record<string, string[]>>({})

  const form = useForm<z.infer<typeof teacherFormSchema>>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: {
      name: "",
      username: "", // Add username default value
      email: "",
      password: "",
      gender: "",
      subjectAreas: [],
      subjects: [],
      experience: "",
      education: "",
      bio: ""
    }
  })

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    watch, // Add watch
    formState: { errors },
  } = form

  // Watch all form fields
  const formValues = watch()

  // Log form values on every change
  React.useEffect(() => {
    console.log('Form values:', formValues)
  }, [formValues])

  const availableSubjects = React.useMemo(() => {
    const area = subjectAreas.find(a => a.value === selectedAreas[0])
    return area?.subjects || []
  }, [selectedAreas])

  const handleAreaSelect = (value: string) => {
    setSelectedAreas(prev => {
      const updated = prev.includes(value) 
        ? prev.filter(a => a !== value)
        : [...prev, value]
      
      // Update form value
      setValue("subjectAreas", updated)
      
      // Clear subjects for removed area
      if (!updated.includes(value)) {
        setSubjectsByArea(prev => {
          const { [value]: _, ...rest } = prev
          return rest
        })
      }
      
      return updated
    })
  }

  const handleSubjectToggle = (area: string, subject: string) => {
    setSubjectsByArea(prev => {
      const areaSubjects = prev[area] || []
      const updated = areaSubjects.includes(subject)
        ? areaSubjects.filter(s => s !== subject)
        : [...areaSubjects, subject]
      
      const newState = {
        ...prev,
        [area]: updated
      }
      
      // Update form value
      const formattedSubjects = Object.entries(newState).map(([area, subjects]) => ({
        area,
        subjects
      }))
      setValue("subjects", formattedSubjects)
      
      return newState
    })
  }

  const onSubmit = async (data: z.infer<typeof teacherFormSchema>) => {
    try {
      setIsSubmitting(true);
      console.log('Submitting data:', data); // Log final form data

      // const teacherData = {
      //   name: data.name,
      //   username: data.username, // Include username
      //   email: data.email,
      //   password: data.password,
      //   role: "teacher",
      //   gender: data.gender,
      //   teacherProfile: {
      //     subjects: data.subjects.map(subject => ({
      //       area: subject.area,
      //       subjects: subject.subjects,
      //       level: "intermediate",
      //       yearsOfExperience: parseInt(data.experience)
      //     })),
      //     qualifications: [{
      //       degree: data.education,
      //       institution: "",
      //       year: new Date().getFullYear(),
      //     }],
      //     verificationStatus: 'pending',
      //     adminVerified: false,
      //     rating: 0,
      //     reviews: [],
      //     availability: [],
      //     bio: data.bio,
      //   }
      // };

      const teacherData = {
        name: data.name,
        username: data.username,
        email: data.email,
        password: data.password,
        role: "teacher",
        gender: data.gender,
        teacherProfile: {
          subjects: data.subjects.map(subject => ({
            area: subject.area,
            subjects: subject.subjects
          })),
          qualifications: [{
            degree: data.education,
            institution: "",
            year: new Date().getFullYear(),
          }],
          verificationStatus: 'pending',
          adminVerified: false,
          rating: 0,
          reviews: [],
          availability: [],
          bio: data.bio,
        }
      };
      

      console.log('Processed teacher data:', teacherData);
      // Debug logs
      console.log('Form Data:', data);
      console.log('Processed Teacher Data:', teacherData);

      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teacherData),
      });

      // Debug response
      const responseData = await response.json();
      console.log('API Response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to create account");
      }

      toast.success(
        "Account created successfully!", 
        { description: "Please check your email to verify your account." }
      );
      
      // Instead of redirecting to verify-email, redirect to pending page
      router.push(`/verify-email/pending?role=teacher&email=${encodeURIComponent(data.email)}`);
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to create account");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    "Basic Information",
    "Subject Selection",
    "Qualifications"
  ]

  const handleNext = async () => {
    let isValid = false
    
    switch (currentStep) {
      case 0:
        isValid = await trigger(["name", "email", "password", "gender"])
        break
      case 1:
        isValid = await trigger(["subjectAreas", "subjects"])
        break
      case 2:
        isValid = await trigger(["experience", "education", "bio"])
        if (isValid) {
          await handleSubmit(onSubmit)()
          return
        }
        break
    }

    if (isValid) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => setCurrentStep((prev) => prev - 1)

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Create Teacher Account</h1>
        <p className="text-sm text-muted-foreground">
          Start your teaching journey with Workmate
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
            register={register}
            setValue={setValue}
            errors={errors}
            isSubmitting={isSubmitting}
          />
        )}

        {currentStep === 1 && (
          <SubjectsStep 
            register={register}
            setValue={setValue}
            errors={errors}
            isSubmitting={isSubmitting}
            selectedAreas={selectedAreas}
            setSelectedAreas={setSelectedAreas}
            subjectsByArea={subjectsByArea}
            setSubjectsByArea={setSubjectsByArea}
            handleAreaSelect={handleAreaSelect}
            handleSubjectToggle={handleSubjectToggle}
            subjectAreas={subjectAreas}
          />
        )}

        

        {currentStep === 2 && (
          <QualificationsStep 
            register={register}
            setValue={setValue}
            errors={errors}
            isSubmitting={isSubmitting}
            qualifications={qualifications}
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
