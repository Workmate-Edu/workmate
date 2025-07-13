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
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

// CTO Recommendation: Do NOT accept email as username. Only allow usernames with 3-20 chars, letters, numbers, underscores, hyphens.
const usernameSchema = z.string().min(3).max(20).regex(
  /^[a-zA-Z0-9_-]{3,20}$/,
  "Username must be 3-20 chars and only letters, numbers, underscores, hyphens"
)

const teacherFormSchema = z.object({
  name: z.string().min(2),
  username: usernameSchema,
  email: z.string().email(),
  password: z.string().min(8),
  gender: z.string().min(1, "Please select your gender"),
  phone: z.string().min(10, "Phone number is required").regex(/^\+/, "Phone number must include country code"),
  subjectAreas: z.array(z.string()).min(1, "Select at least one subject area"),
  subjects: z.array(z.object({
    area: z.string(),
    subjects: z.array(z.string()).min(1)
  })).min(1, "Select subjects for each area"),
  experience: z.string().min(1, "Years of experience required"),
  education: z.string().min(1, "Education qualification required"),
  bio: z.string().min(20, "Bio should be at least 20 characters"),
  teacherProfile: z.object({
    subjects: z.array(z.object({
      area: z.string(),
      subjects: z.array(z.string())
    })),
    qualifications: z.array(z.object({
      degree: z.string(),
      institution: z.string(),
      year: z.number()
    })),
    bio: z.string()
  })
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
      { label: "English", value: "english" },
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
  const [backendError, setBackendError] = React.useState<string | null>(null)

  const form = useForm<z.infer<typeof teacherFormSchema>>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      gender: "",
      phone: "",
      subjectAreas: [],
      subjects: [],
      experience: "",
      education: "",
      bio: "",
      teacherProfile: {
        subjects: [],
        qualifications: [],
        bio: ""
      }
    }
  });

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    watch,
    formState: { errors, touchedFields },
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

      const teacherData = {
        name: data.name,
        username: data.username,
        email: data.email,
        password: data.password,
        role: "teacher",
        gender: data.gender,
        phone: data.phone,
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

  // On Next/Submit, show error if username is an email
  const handleNext = async () => {
    let isValid = false
    setBackendError(null)
    switch (currentStep) {
      case 0:
        isValid = await trigger(["name", "email", "username", "password", "gender", "phone"])
        // Extra check: do not allow email as username
        const usernameVal = form.getValues("username")
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usernameVal)) {
          setBackendError("Please choose a username that is NOT an email address. Usernames must be 3-20 chars and only letters, numbers, underscores, hyphens.")
          return
        }
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
    if (isValid) setCurrentStep((prev) => prev + 1)
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
          <>
            <BasicInfoStep 
              register={register}
              setValue={setValue}
              errors={errors}
              isSubmitting={isSubmitting}
            />
            {/* Username error message, only show if touched or backend error */}
            {/* {(errors.username && touchedFields.username) && (
              <p className="text-sm text-red-500 mt-1">{errors.username.message}</p>
            )}
            {backendError && (
              <p className="text-sm text-red-500 mt-1">{backendError}</p>
            )} */}
          </>
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

        <div className="flex justify-center gap-8 pt-4">
          {currentStep > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={isSubmitting}
              className="w-32"
            >
              Back
            </Button>
          )}
          <Button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
            className={`whitespace-nowrap ${currentStep === 0 ? "w-full" : "w-32"}`}
          >
            {currentStep === steps.length - 1 
              ? isSubmitting 
                ? "Creating..." 
                : "Create Account"
              : "Next"
            }
          </Button>
        </div>
      </form>
    </div>
  )
}
