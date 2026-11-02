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
import { LegalConsentFields } from './legal-consent-fields';
import { residenceCountrySchema } from '@/lib/legal-consent';
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { phoneNumberSchema } from '@/lib/phone-number';
import { firstSignupErrorMessage } from '@/lib/signup-validation';

// CTO Recommendation: Do NOT accept email as username. Only allow usernames with 3-20 chars, letters, numbers, underscores, hyphens.
const usernameSchema = z.string().min(1, 'Username is required').min(3, 'Username must be at least 3 characters').max(20, 'Username must be no more than 20 characters').regex(
  /^[a-zA-Z0-9_-]{3,20}$/,
  "Username must be 3-20 chars and only letters, numbers, underscores, hyphens"
)

const teacherFormSchema = z.object({
  name: z.string().min(2, 'Full Name is required'),
  username: usernameSchema,
  email: z.string().min(1, 'Email is required').email('Email must be a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  gender: z.string().min(1, "Gender is required"),
  phone: phoneNumberSchema,
  subjectAreas: z.array(z.string()).min(1, "Subject Areas: select at least one"),
  subjects: z.array(z.object({
    area: z.string(),
    subjects: z.array(z.string()).min(1, "Subject Areas: select at least one subject")
  })).min(1, "Subject Areas: select at least one subject"),
  experience: z.string().min(1, "Years of Experience is required"),
  education: z.string().min(1, "Educational Background is required"),
  bio: z.string().min(20, "Professional Bio must be at least 20 characters"),
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
  }),
  residenceCountry: residenceCountrySchema.or(z.literal('')).refine(Boolean, 'Country of residence is required'),
  termsAccepted: z.boolean().refine(Boolean, 'Terms of Service must be accepted'),
  privacyAcknowledged: z.boolean().refine(Boolean, 'Privacy Policy must be acknowledged'),
  teacherConductAccepted: z.boolean().refine(Boolean, 'Teacher confidentiality, conduct and online-meeting rules must be accepted'),
  marketingOptIn: z.boolean(),
})

const subjectAreas = [
  { 
    label: "STEM", 
    value: "stem",
    subjects: [
      { label: "Artificial Intelligence", value: "ai" },
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
      residenceCountry: '',
      termsAccepted: false,
      privacyAcknowledged: false,
      teacherConductAccepted: false,
      marketingOptIn: false,
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
      const teacherData = {
        name: data.name,
        username: data.username,
        email: data.email,
        password: data.password,
        role: "teacher",
        gender: data.gender,
        phone: data.phone,
        residenceCountry: data.residenceCountry,
        termsAccepted: data.termsAccepted,
        privacyAcknowledged: data.privacyAcknowledged,
        teacherConductAccepted: data.teacherConductAccepted,
        marketingOptIn: data.marketingOptIn,
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

      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teacherData),
      });

      const responseData = await response.json();

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
          const message = "Username cannot be an email address. Use 3-20 letters, numbers, underscores or hyphens."
          setBackendError(message)
          toast.error(message)
          return
        }
        break
      case 1:
        isValid = await trigger(["subjectAreas", "subjects"])
        break
      case 2:
        isValid = await trigger(["experience", "education", "bio", "residenceCountry", "termsAccepted", "privacyAcknowledged", "teacherConductAccepted"])
        if (isValid) {
          await handleSubmit(onSubmit, () => {
            toast.error(firstSignupErrorMessage(form.getFieldState, ['experience', 'education', 'bio', 'residenceCountry', 'termsAccepted', 'privacyAcknowledged', 'teacherConductAccepted'], 'Review the highlighted fields'))
          })()
          return
        }
        break
    }
    if (isValid) setCurrentStep((prev) => prev + 1)
    else {
      const fields = currentStep === 0
        ? ['name', 'email', 'username', 'password', 'gender', 'phone']
        : currentStep === 1
          ? ['subjectAreas', 'subjects']
          : ['experience', 'education', 'bio', 'residenceCountry', 'termsAccepted', 'privacyAcknowledged', 'teacherConductAccepted']
      toast.error(firstSignupErrorMessage(form.getFieldState, fields, 'Review the highlighted fields'))
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

        <LegalConsentFields register={register} errors={errors} role="teacher" residenceCountry={watch('residenceCountry')} onResidenceCountryChange={value => setValue('residenceCountry', value, { shouldValidate: true, shouldDirty: true, shouldTouch: true })} />

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
