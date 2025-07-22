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
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

const usernameSchema = z.string().min(3).max(20).regex(
  /^[a-zA-Z0-9_-]{3,20}$/,
  "Username must be 3-20 chars and only letters, numbers, underscores, hyphens"
)

const studentFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  username: usernameSchema,
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().min(10, "Phone number is required"),
  gender: z.string().min(1, "Gender is required"),
  ageGroup: z.string().min(1, "Age group is required"),
  educationLevel: z.string().min(1, "Education level is required"),
  grade: z.string().min(1, "Grade is required"),
  subjectAreas: z.array(z.string()).min(1, "Select at least one subject area"),
  subjects: z
    .array(
      z.object({
        name: z.string(),
        area: z.string()
      })
    )
    .min(1, "Select at least one subject")
});

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

export function StudentSignUpForm() {
  const [currentStep, setCurrentStep] = React.useState(0)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [selectedLevel, setSelectedLevel] = React.useState("")
  const [selectedAreas, setSelectedAreas] = React.useState<string[]>([])
  const [selectedSubjects, setSelectedSubjects] = React.useState<string[]>([])
  const [backendError, setBackendError] = React.useState<string | null>(null)
  
  const router = useRouter()

  const form = useForm<z.infer<typeof studentFormSchema>>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      name: "",
      email: "",
      username: "",
      password: "",
      phone: "",
      gender: "",
      ageGroup: "",
      educationLevel: "",
      grade: "",
      subjectAreas: [],
      subjects: []
    }
  })

  const { register, handleSubmit, formState: { errors }, setValue, trigger } = form

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
  

  // const handleNext = () => {
  //   if (currentStep === steps.length - 1) {
  //     // On last step, directly call onSubmit with form values
  //     onSubmit(form.getValues());
  //     return;
  //   }
  //   setCurrentStep((prev) => prev + 1);
  // };

  const handleNext = async () => {
  setBackendError(null);
  console.log("Current step:", currentStep);

  let fieldsToValidate: (keyof typeof studentFormSchema._type)[] = [];

  if (currentStep === 0) {
    fieldsToValidate = ["name","username","email","password","phone","gender","ageGroup"];
  } else if (currentStep === 1) {
    fieldsToValidate = ["educationLevel","grade"];
  } else {
    // validate everything on final "Create Account" click
    fieldsToValidate = [
      "name","username","email","password","phone","gender","ageGroup",
      "educationLevel","grade","subjectAreas","subjects"
    ];
  }

  const isValid = await trigger(fieldsToValidate);
  console.log({ currentStep, isValid, errors: form.formState.errors });

  if (isValid) {
    if (currentStep === steps.length - 1) {
      await handleSubmit(onSubmit)();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  }
};


  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const onSubmit = async (data: z.infer<typeof studentFormSchema>) => {
    try {
      setIsSubmitting(true);

      const formData = {
        ...data,
        role: 'student',
        studentProfile: {
          grade: data.grade,
          subjects: selectedSubjects.map(subject => ({
            name: subject,
            area: selectedAreas.find(area => 
              subjectAreas.find(a => a.value === area)?.subjects.some(s => s.value === subject)
            ) || "",
            progress: 0
          }))
        }
      };

      console.log('Form values:', formData);

      const response = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create account");
      }

      toast.success("Account created! Please verify your email.");
      router.push(`/verify-email/pending?role=student&email=${encodeURIComponent(data.email)}`);
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to create account");
    } finally {
      setIsSubmitting(false);
    }
  };

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

      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        {currentStep === 0 && (
          <>
          <BasicInfoStep 
            form={form}
            register={form.register}
            setValue={form.setValue}
            errors={form.formState.errors}
            isSubmitting={isSubmitting}
          />
           {backendError && (
                        <p className="text-sm text-red-500 mt-1">{backendError}</p>
                      )}
          </>
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
