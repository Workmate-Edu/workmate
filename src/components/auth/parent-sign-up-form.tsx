"use client"

import * as React from "react"
import * as z from "zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { educationLevels, gradesByLevel } from "@/lib/constants/education"
import { genderOptions } from "@/lib/constants/general"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller, type Control } from "react-hook-form"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { toast } from "sonner"
import { BaseSignUpFields } from "./base-sign-up-form"
import { Badge } from "@/components/ui/badge"
import { X, Eye, EyeOff, Trash2  } from "lucide-react"
import { FiLoader } from "react-icons/fi"
import { Stepper } from "@/components/ui/stepper"
import type { StepProps, LearningPreferencesStepProps, Option } from "@/types/form"
import type { ParentFormData } from "@/types/auth"
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { ChildLearningStep, blankLearner } from './child-learning-step';
import { parentOnboardingSchema, readPricingDraft, PRICING_DRAFT_KEY, type ParentOnboarding } from '@/lib/parent-onboarding';
import { LegalConsentFields, ResidenceCountryField } from './legal-consent-fields';
import { residenceCountrySchema } from '@/lib/legal-consent';
import { cn } from '@/lib/utils';
import { phoneNumberSchema } from '@/lib/phone-number';
import { firstSignupErrorMessage } from '@/lib/signup-validation';


const ageGroupOptions = [
  { value: '3-5', label: '3-5 years' },
  { value: '6-8', label: '6-8 years' },
  { value: '9-11', label: '9-11 years' },
  { value: '12-14', label: '12-14 years' },
  { value: '15-17', label: '15-17 years' },
  { value: '18+', label: '18+ years' },
];

const gradeOptions = [
  { value: "1", label: "Grade 1" },
  { value: "2", label: "Grade 2" },
  { value: "3", label: "Grade 3" },
  { value: "4", label: "Grade 4" },
  { value: "5", label: "Grade 5" },
  { value: "6", label: "Grade 6" },
  { value: "7", label: "Grade 7" },
  { value: "8", label: "Grade 8" },
  { value: "9", label: "Grade 9" },
  { value: "10", label: "Grade 10" },
  { value: "11", label: "Grade 11" },
  { value: "12", label: "Grade 12" },
]

const usernameSchema = z.string().min(1, 'Username is required').min(3, 'Username must be at least 3 characters').max(20, 'Username must be no more than 20 characters').regex(
  /^[a-zA-Z0-9_-]{3,20}$/,
  "Username must be 3-20 chars and only letters, numbers, underscores, hyphens"
)

const parentFormSchema = z.object({
  name: z.string().min(2, 'Full Name is required'),
  email: z.string().min(1, 'Email is required').email('Email must be a valid email address'),
  username: usernameSchema,
  password: z.string().min(8, 'Password must be at least 8 characters'),
  gender: z.string().min(1, "Gender is required"),
  phone: phoneNumberSchema,
  interestedInLearning: z.boolean(),
  educationLevel: z.string().optional(),
  subjectAreas: z.array(z.string()).optional(),
  subjects: z.array(z.string()).optional(),
  residenceCountry: residenceCountrySchema.or(z.literal('')).refine(Boolean, 'Country of residence is required'),
  termsAccepted: z.boolean().refine(Boolean, 'Terms of Service must be accepted'),
  privacyAcknowledged: z.boolean().refine(Boolean, 'Privacy Policy must be acknowledged'),
  parentalAuthority: z.boolean().refine(Boolean, 'Parent or legal guardian authority must be confirmed'),
  marketingOptIn: z.boolean(),
})


// Add subject areas constant (same as student form)
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

// function BasicInfoStep({ register, errors, isSubmitting, setValue }: StepProps) {
//   return (
//     <div className="space-y-4">
//       <BaseSignUpFields 
//         register={register}
//         errors={errors}
//         isSubmitting={isSubmitting}
//       />
      
//       <div>
//         <Label>Gender</Label>
//         <Select
//           onValueChange={(value) => setValue("gender", value)}
//           disabled={isSubmitting}
//         >
//           <SelectTrigger className="w-full">
//             <SelectValue placeholder="Select your gender..." />
//           </SelectTrigger>
//           <SelectContent>
//             {genderOptions.map((option) => (
//               <SelectItem key={option.value} value={option.value}>
//                 {option.label}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>
//       <div>
//         <Label>Phone Number</Label>
//         <Input type="tel" {...register("phone")} />
//       </div>
//     </div>
//   )
// }


export function BasicInfoStep({ register, errors, isSubmitting, setValue }: StepProps) {
  return (
    <div className="space-y-4">
      <BaseSignUpFields 
        register={register}
        errors={errors}
        isSubmitting={isSubmitting}
      />

      <div className={cn("rounded-lg border border-transparent p-3", errors.gender && "border-destructive bg-destructive/5")}>
        <Label className={cn(errors.gender && "text-destructive")}>Gender</Label>
        <Select
          onValueChange={(value) => setValue("gender", value)}
          disabled={isSubmitting}
        >
          <SelectTrigger aria-invalid={Boolean(errors.gender)} className={cn("w-full", errors.gender && "border-destructive")}>
            <SelectValue placeholder="Select your gender..." />
          </SelectTrigger>
          <SelectContent>
            {genderOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.gender && (
          <p className="text-sm text-red-500">{errors.gender.message}</p>
        )}
      </div>

      <div className={cn("rounded-lg border border-transparent p-3", errors.phone && "border-destructive bg-destructive/5")}>
  <Label className={cn(errors.phone && "text-destructive")}>Phone Number</Label>
  <div className="relative">
  <PhoneInput
  country={'ng'}
  inputProps={{
    name: 'phone',
    required: true,
    'aria-invalid': Boolean(errors.phone),
  }}
  onChange={(value) => setValue('phone', `+${value}`)}
  disabled={isSubmitting}
  containerClass="w-full"
  inputClass={cn("!pl-14 !w-full !h-10 !text-sm !rounded-md !border !border-input !bg-background !text-foreground", errors.phone && "!border-destructive")}
  buttonClass="!border-0 !bg-transparent !absolute !left-3 !top-1/2 !-translate-y-1/2 z-10"
  dropdownClass="!bg-white !text-black !z-[1000]"
/>
  {errors.phone && (
    <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
  )}
</div>

</div>

    </div>
  )
}


function LearningPreferencesStep({
  register,
  errors,
  isSubmitting,
  setValue,
  control,
  interestedInLearning,
  setInterestedInLearning,
  selectedAreas,
  setSelectedAreas,
  selectedSubjects,
  setSelectedSubjects,
  availableSubjects,
  handleAreaToggle,
  handleSubjectToggle
}: LearningPreferencesStepProps & {
  availableSubjects: Option[];
  handleAreaToggle: (value: string) => void;
  handleSubjectToggle: (value: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Controller
  name="interestedInLearning"
  control={control}
  render={({ field }) => (
    <input
      type="checkbox"
      id="interestedInLearning"
      className="rounded border-gray-300"
      checked={field.value} 
      // keep your local state in sync if you need it:
      onChange={e => {
        field.onChange(e.target.checked)
        setInterestedInLearning(e.target.checked)
      }}
    />
  )}
/>

        <Label htmlFor="interestedInLearning">
          I'm also interested in learning
        </Label>
      </div>

      {interestedInLearning && (
        <div className="space-y-4 pl-4 border-l-2 border-primary/20">
          <div>
            <Label>Your Education Level</Label>
            <Select
              onValueChange={(value) => setValue("educationLevel", value)}
              disabled={isSubmitting}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select your education level..." />
              </SelectTrigger>
              <SelectContent>
                {educationLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Subject Areas You Want to Learn</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedAreas.map(area => {
                const areaData = subjectAreas.find(a => a.value === area)
                return (
                  <Badge key={area} variant="secondary">
                    {areaData?.label}
                    <button
                      type="button"
                      className="ml-1"
                      onClick={() => handleAreaToggle(area)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )
              })}
            </div>
            <Select
              onValueChange={handleAreaToggle}
              disabled={isSubmitting}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select subject areas..." />
              </SelectTrigger>
              <SelectContent>
                {subjectAreas.map((area) => (
                  <SelectItem 
                    key={area.value} 
                    value={area.value}
                  >
                    {area.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedAreas.length > 0 && (
            <div>
              <Label>Specific Subjects</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedSubjects.map(subject => {
                  const subjectData = availableSubjects.find(s => s.value === subject)
                  return (
                    <Badge key={subject} variant="secondary">
                      {subjectData?.label}
                      <button
                        type="button"
                        className="ml-1"
                        onClick={() => handleSubjectToggle(subject)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )
                })}
              </div>
              <Select
                onValueChange={handleSubjectToggle}
                disabled={isSubmitting}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select subjects..." />
                </SelectTrigger>
                <SelectContent>
                  {availableSubjects.map((subject) => (
                    <SelectItem 
                      key={subject.value} 
                      value={subject.value}
                      disabled={selectedSubjects.includes(subject.value)}
                    >
                      {subject.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function ParentSignUpForm() {
  const router = useRouter()
  const [onboarding, setOnboarding] = React.useState<ParentOnboarding>({ learners: [blankLearner()] });
  React.useEffect(() => {
    const pricingDraft = readPricingDraft();
    const count = Math.max(1, ...(pricingDraft?.subjects.map(item => item.students) || []));
    const learners = Array.from({ length: count }, (_, index) => {
      const subjects = (pricingDraft?.subjects.filter(item => index < item.students).map(item => item.subject) || []);
      return { ...blankLearner(), subjects, prioritySubject: subjects[0] || 'Mathematics' as const };
    });
    setOnboarding({ learners, pricingDraft });
  }, []);
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [interestedInLearning, setInterestedInLearning] = React.useState(false)
  const [selectedSubjects, setSelectedSubjects] = React.useState<string[]>([])
  const [selectedAreas, setSelectedAreas] = React.useState<string[]>([])
  const [currentStep, setCurrentStep] = React.useState(0)
  const [backendError, setBackendError] = React.useState<string | null>(null)
  const [onboardingHasError, setOnboardingHasError] = React.useState(false)
  const [learnerErrors, setLearnerErrors] = React.useState<Record<number, Record<string, string>>>({})

  const form = useForm<ParentFormData>({
    resolver: zodResolver(parentFormSchema),
    defaultValues: {
      name: "",
      email: "",
      username: "",
      password: "",
      gender: "",
      phone: "",
      interestedInLearning: false,
      educationLevel: "",
      subjectAreas: [],
      subjects: [],
      children: [],
      residenceCountry: '',
      termsAccepted: false,
      privacyAcknowledged: false,
      parentalAuthority: false,
      marketingOptIn: false,
    }
    
  })
  const {
    register,
    control, 
    handleSubmit,
    setValue,
    watch,
    formState: { errors, touchedFields },
    trigger,
    getValues,
    getFieldState,
  } = form

 
  const availableSubjects = React.useMemo(() => {
    return selectedAreas.flatMap(area => {
      const foundArea = subjectAreas.find(a => a.value === area)
      return foundArea?.subjects || []
    })
  }, [selectedAreas])

  const handleAreaToggle = (areaValue: string) => {
    setSelectedAreas((current) => {
      const isSelected = current.includes(areaValue);
      let updatedAreas: string[];
  
      if (isSelected) {
        const area = subjectAreas.find((a) => a.value === areaValue);
        const areaSubjects = area?.subjects.map((s) => s.value) || [];
        setSelectedSubjects((subs) => subs.filter((s) => !areaSubjects.includes(s)));
        updatedAreas = current.filter((a) => a !== areaValue);
      } else {
        updatedAreas = [...current, areaValue];
      }
  
      setValue("subjectAreas", updatedAreas); // ✅ fix: use updated list
      return updatedAreas;
    });
  };
  

  const handleSubjectToggle = (subjectValue: string) => {
    setSelectedSubjects((current) => {
      const isSelected = current.includes(subjectValue);
      const updated = isSelected
        ? current.filter((s) => s !== subjectValue)
        : [...current, subjectValue];
  
      setValue("subjects", updated); // ✅ fix: use updated list
      return updated;
    });
  };
  

  const onSubmit = async (data: ParentFormData) => {

    try {
      const learnerWithoutAge = onboarding.learners.findIndex(learner => learner.age === undefined);
      if (learnerWithoutAge >= 0) {
        const message = 'Age is required';
        setBackendError(message);
        toast.error(message);
        setOnboardingHasError(true);
        setLearnerErrors({ [learnerWithoutAge]: { age: message } });
        return;
      }
      const validated = parentOnboardingSchema.safeParse(onboarding);
      if (!validated.success) {
        const nextLearnerErrors: Record<number, Record<string, string>> = {};
        for (const issue of validated.error.issues) {
          if (issue.path[0] !== 'learners' || typeof issue.path[1] !== 'number' || typeof issue.path[2] !== 'string') continue;
          const learnerIndex = issue.path[1];
          nextLearnerErrors[learnerIndex] = { ...nextLearnerErrors[learnerIndex], [issue.path[2]]: issue.message };
        }
        const message = validated.error.issues[0]?.message || 'Review your children’s learning needs';
        setBackendError(message);
        toast.error(message);
        setOnboardingHasError(true);
        setLearnerErrors(nextLearnerErrors);
        return;
      }
      setOnboardingHasError(false);
      setLearnerErrors({});
      setBackendError(null);
      setIsSubmitting(true);

      const formData = {
        name: data.name,
        email: data.email,
        username: data.username,
        password: data.password,
        role: "parent",
        gender: data.gender,
        phone: data.phone,
        residenceCountry: data.residenceCountry,
        termsAccepted: data.termsAccepted,
        privacyAcknowledged: data.privacyAcknowledged,
        parentalAuthority: data.parentalAuthority,
        marketingOptIn: data.marketingOptIn,
        parentProfile: {
          onboarding: validated.data,
          interestedInLearning: data.interestedInLearning, // <-- ensure this is set
          educationLevel: data.educationLevel,
          subjects: data.subjects || [],
          // ...existing code for children if you add children in the future
        }
      }
      
      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create account");
      }

      try { sessionStorage.removeItem(PRICING_DRAFT_KEY); } catch {}
      toast.success("Account created! Verify your email so our team can review your teacher preferences.");
      router.push(`/verify-pending?email=${encodeURIComponent(data.email)}`);
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create account");
    } finally {
      setIsSubmitting(false);
    }
  };


  const steps = [
    "Basic Information",
    "Your children’s learning needs"
  ]
  
  // const handleNext = async () => {
  //   let isValid = false
  //   setBackendError(null)
  //   switch (currentStep) {
  //     case 0:
  //       isValid = await trigger(["name", "email", "username", "password", "gender", "phone"])
  //       // Extra check: do not allow email as username
  //       const usernameVal = getValues("username")
  //       if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usernameVal)) {
  //         setBackendError("Please choose a username that is NOT an email address. Usernames must be 3-20 chars and only letters, numbers, underscores, hyphens.")
  //         return
  //       }
  //       break
  //     case 1:
  //       isValid = true; // Learning preferences optional
  //       if (isValid) await onSubmit(getValues());
  //       return;
  //   }
  //   if (isValid) setCurrentStep((prev) => prev + 1)
  // }
  
  const handleNext = async () => {
  let isValid = false;
  setBackendError(null);

  switch (currentStep) {
    case 0:
      // Validate required base fields
      isValid = await trigger([
        "name",
        "email",
        "username",
        "password",
        "gender",
        "phone",
        "residenceCountry"
      ]);

      // Extra check: username must not be an email
      const usernameVal = getValues("username");
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usernameVal)) {
        const message = "Username cannot be an email address. Use 3-20 letters, numbers, underscores or hyphens.";
        setBackendError(message);
        toast.error(message);
        return;
      }
      break;

    case 1:
      // Learning preferences are optional → submit the form
      const legalValid = await trigger(['residenceCountry', 'termsAccepted', 'privacyAcknowledged', 'parentalAuthority']);
      if (!legalValid) {
        toast.error(firstSignupErrorMessage(getFieldState, ['residenceCountry', 'termsAccepted', 'privacyAcknowledged', 'parentalAuthority'], 'Review the highlighted permissions'));
        return;
      }
      await handleSubmit(onSubmit, () => {
        toast.error(firstSignupErrorMessage(getFieldState, ['name', 'email', 'username', 'password', 'gender', 'phone', 'residenceCountry', 'termsAccepted', 'privacyAcknowledged', 'parentalAuthority'], 'Review the highlighted fields'));
      })();
      return;
  }

  // If Step 0 passed, advance to Step 1
  if (isValid) {
    setCurrentStep((prev) => prev + 1);
  } else {
    toast.error(firstSignupErrorMessage(getFieldState, ['name', 'email', 'username', 'password', 'gender', 'phone', 'residenceCountry'], 'Review the highlighted fields'));
  }
};


  const handleBack = () => {
    setCurrentStep((prev) => prev - 1)
  }

  const renderButtonContent = () => {
    if (currentStep === steps.length - 1) {
      if (isSubmitting) {
        return "Creating..."
      }
      return "Create Account"
    }
    return "Next"
  }

  return (
    <div className="w-full max-w-xl space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Create Parent Account</h1>
        <p className="text-sm text-muted-foreground">
          Monitor and support your child's learning journey
        </p>
      </div>

      <Stepper 
        steps={steps} 
        currentStep={currentStep}
        onStepClick={(step) => {
          // Only allow going back to previous steps
          if (step < currentStep) {
            setCurrentStep(step)
          }
        }}
      />

      <form className="space-y-6" onSubmit={event => { event.preventDefault(); void handleNext(); }}>
        <p className="text-sm font-medium text-secondary">Step {currentStep + 1} of {steps.length}: {steps[currentStep]}</p>
        {backendError && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{backendError}</p>}
        {currentStep === 0 && (
          <>
            <BasicInfoStep 
              register={register}
              setValue={setValue}
              errors={errors}
              isSubmitting={isSubmitting}
              getValues={getValues}
            />
            <ResidenceCountryField register={register} residenceCountry={watch('residenceCountry')} onResidenceCountryChange={value => setValue('residenceCountry', value, { shouldValidate: true, shouldDirty: true, shouldTouch: true })} error={errors.residenceCountry?.message} />
            {/* {(errors.username && touchedFields.username) && (
              <p className="text-sm text-red-500 mt-1">{errors.username.message}</p>
            )}
            {backendError && (
              <p className="text-sm text-red-500 mt-1">{backendError}</p>
            )} */}
          </>
        )}

        {currentStep === 1 && (
          <>
          <ChildLearningStep value={onboarding} onChange={value => { setOnboarding(value); setOnboardingHasError(false); setLearnerErrors({}); }} disabled={isSubmitting} showAvailability={false} hasError={onboardingHasError} learnerErrors={learnerErrors} />
          <details className="rounded-xl border p-4"><summary className="cursor-pointer text-sm font-medium">Optional: I also want to learn</summary>
          <LearningPreferencesStep 
            register={register}
            control={control}
            setValue={setValue}
            errors={errors}
            isSubmitting={isSubmitting}
            getValues={getValues}
            interestedInLearning={interestedInLearning}
            setInterestedInLearning={setInterestedInLearning}
            selectedAreas={selectedAreas}
            setSelectedAreas={setSelectedAreas}
            selectedSubjects={selectedSubjects}
            setSelectedSubjects={setSelectedSubjects}
            availableSubjects={availableSubjects}
            handleAreaToggle={handleAreaToggle}
            handleSubjectToggle={handleSubjectToggle}
          />
          </details>
          </>
        )}

        {/* {currentStep === 2 && (
          <ChildrenInfoStep 
            register={register}
            setValue={setValue}
            errors={errors}
            isSubmitting={isSubmitting}
            getValues={getValues}
            children={children}
            setChildren={setChildren}
          />
        )} */}

        {currentStep === 1 && <LegalConsentFields register={register} errors={errors} role="parent" residenceCountry={watch('residenceCountry')} onResidenceCountryChange={value => setValue('residenceCountry', value, { shouldValidate: true, shouldDirty: true, shouldTouch: true })} showResidenceCountry={false} />}

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

