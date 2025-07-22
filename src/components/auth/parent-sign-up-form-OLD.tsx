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
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { toast } from "sonner"
import { BaseSignUpFields } from "./base-sign-up-form"
import { Command, CommandGroup, CommandItem } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { X, Eye, EyeOff, Trash2  } from "lucide-react"
import { FiLoader } from "react-icons/fi"
import { Stepper } from "@/components/ui/stepper"
import type { StepProps, LearningPreferencesStepProps, ChildrenStepProps, Option } from "@/types/form"
import type { ParentFormData } from "@/types/auth"
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'


interface ChildInfo {
  name: string;
  educationLevel: string;
  grade: string;
  gender: string;
  ageGroup: string;
  username: string;
  password: string;
  subjects: Array<{ area: string, name: string }>;
}


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

// const parentFormSchema = z.object({
//   name: z.string().min(2, "Name must be at least 2 characters"),
//   email: z.string().email("Invalid email address"),
//   username: z.string().min(3, "Username must be at least 3 characters")
//     .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscore"),
//   password: z.string().min(8, "Password must be at least 8 characters"),
//   gender: z.string().min(1, "Please select your gender"),
//   phone: z.string().min(10, "Valid phone number required"),
//   interestedInLearning: z.boolean(),
//   educationLevel: z.string().optional(),
//   subjectAreas: z.array(z.string()).optional(),
//   subjects: z.array(z.string()).optional(),
//   children: z.array(z.object({
//     name: z.string().min(2, "Child's name is required"),
//     gender: z.string().min(1, "Child's gender is required"),
//     educationLevel: z.string().min(1, "Education level is required"),
//     grade: z.string().min(1, "Grade is required"),
//   })).min(1, "Add at least one child").default([]),
// })

const parentFormSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(8),
  gender: z.string(),
  phone: z.string().min(10),
  interestedInLearning: z.boolean(),
  educationLevel: z.string().optional(),
  subjectAreas: z.array(z.string()).optional(),
  subjects: z.array(z.string()).optional(),
  children: z.array(z.object({
    name: z.string().min(2),
    gender: z.string().min(1),
    educationLevel: z.string().min(1),
    grade: z.string().min(1),
    username: z.string().min(3),
    password: z.string().min(6),
  })).min(1).default([])
})


// Add subject areas constant (same as student form)
const subjectAreas = [
  { 
    label: "STEM", 
    value: "stem",
    subjects: [
      { label: "Mathematics", value: "math" },
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

      <div>
        <Label>Gender</Label>
        <Select
          onValueChange={(value) => setValue("gender", value)}
          disabled={isSubmitting}
        >
          <SelectTrigger className="w-full">
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

      <div>
  <Label>Phone Number</Label>
  <div className="relative">
  <PhoneInput
  country={'ng'}
  inputProps={{
    name: 'phone',
    required: true,
  }}
  onChange={(value) => setValue('phone', `+${value}`)}
  disabled={isSubmitting}
  containerClass="w-full"
  inputClass="!pl-14 !w-full !h-10 !text-sm !rounded-md !border !border-input !bg-background !text-foreground"
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
        <input
          type="checkbox"
          id="interestedInLearning"
          className="rounded border-gray-300"
          onChange={(e) => {
            setInterestedInLearning(e.target.checked)
            setValue("interestedInLearning", e.target.checked)
          }}
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


export const ChildrenInfoStep = ({
  register,
  errors,
  isSubmitting,
  setValue,
  children,
  setChildren,
}: ChildrenStepProps) => {
  const [childrenSubjects, setChildrenSubjects] = React.useState(
    children.map(() => [])
  )

  const [showPasswords, setShowPasswords] = React.useState<boolean[]>(
    children.map(() => false)
  )

  const togglePasswordVisibility = (index: number) => {
    setShowPasswords((prev) => {
      const updated = [...prev]
      updated[index] = !updated[index]
      return updated
    })
  }

  const handleAddSubject = (
    childIndex: number,
    area: string,
    subject: { label: string; value: string }
  ) => {
    setChildrenSubjects((prev) => {
      const updated = [...prev]
      const exists = updated[childIndex]?.some(
        (s) => s.area === area && s.name === subject.value
      )
      if (!exists) {
        updated[childIndex] = [
          ...(updated[childIndex] || []),
          { area, name: subject.value },
        ]
      }
      return updated
    })

    const updatedChildren = [...children]
    updatedChildren[childIndex] = {
      ...updatedChildren[childIndex],
      subjects: childrenSubjects[childIndex] || [],
    }
    setChildren(updatedChildren)
  }

  const handleRemoveSubject = (
    childIndex: number,
    area: string,
    name: string
  ) => {
    setChildrenSubjects((prev) => {
      const updated = [...prev]
      updated[childIndex] =
        updated[childIndex]?.filter(
          (s) => !(s.area === area && s.name === name)
        ) || []
      return updated
    })
  }

  const handleRemoveChild = (index: number) => {
    const updatedChildren = [...children]
    updatedChildren.splice(index, 1)
    setChildren(updatedChildren)

    const updatedSubjects = [...childrenSubjects]
    updatedSubjects.splice(index, 1)
    setChildrenSubjects(updatedSubjects)

    const updatedPasswords = [...showPasswords]
    updatedPasswords.splice(index, 1)
    setShowPasswords(updatedPasswords)
  }

  return (
    <div className="space-y-4">
      <Label>Children</Label>
      {children.map((child, index) => (
        <div key={index} className="relative space-y-3 p-4 border rounded-lg">
          {children.length > 1 && (
            <button
              type="button"
              className="absolute right-2 top-2 text-red-500"
              onClick={() => handleRemoveChild(index)}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <Input
            placeholder="Child's name"
            value={child.name}
            onChange={(e) => {
              const updated = [...children]
              updated[index].name = e.target.value
              setChildren(updated)
            }}
          />
          {errors.children?.[index]?.name && (
            <p className="text-sm text-red-500">
              {errors.children[index]?.name?.message}
            </p>
          )}

          <Input
            placeholder="Child's username"
            value={child.username}
            onChange={(e) => {
              const updated = [...children]
              updated[index].username = e.target.value
              setChildren(updated)
            }}
          />
          {errors.children?.[index]?.username && (
            <p className="text-sm text-red-500">
              {errors.children[index]?.username?.message}
            </p>
          )}

          <div className="relative">
            <Input
              placeholder="Child's password"
              type={showPasswords[index] ? "text" : "password"}
              value={child.password}
              onChange={(e) => {
                const updated = [...children]
                updated[index].password = e.target.value
                setChildren(updated)
              }}
              className="pr-10"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
              onClick={() => togglePasswordVisibility(index)}
            >
              {showPasswords[index] ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.children?.[index]?.password && (
            <p className="text-sm text-red-500">
              {errors.children[index]?.password?.message}
            </p>
          )}

          <Select
            value={child.gender}
            onValueChange={(value) => {
              const updated = [...children]
              updated[index].gender = value
              setChildren(updated)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              {genderOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={child.educationLevel}
            onValueChange={(value) => {
              const updated = [...children]
              updated[index].educationLevel = value
              updated[index].grade = ""
              setChildren(updated)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select education level" />
            </SelectTrigger>
            <SelectContent>
              {educationLevels.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {child.educationLevel && (
            <Select
              value={child.grade}
              onValueChange={(value) => {
                const updated = [...children]
                updated[index].grade = value
                setChildren(updated)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select grade" />
              </SelectTrigger>
              <SelectContent>
                {gradesByLevel[child.educationLevel]?.map((grade) => (
                  <SelectItem key={grade.value} value={grade.value}>
                    {grade.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select
            value={child.ageGroup}
            onValueChange={(value) => {
              const updated = [...children]
              updated[index].ageGroup = value
              setChildren(updated)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select age group" />
            </SelectTrigger>
            <SelectContent>
              {ageGroupOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="space-y-2">
            <Label>Subjects</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {childrenSubjects[index]?.map((subject) => (
                <Badge
                  key={`${subject.area}-${subject.name}`}
                  variant="secondary"
                >
                  {subject.name}
                  <button
                    type="button"
                    className="ml-1"
                    onClick={() =>
                      handleRemoveSubject(index, subject.area, subject.name)
                    }
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            {subjectAreas.map((area) => (
              <div key={area.value}>
                <h4 className="text-sm font-medium">{area.label}</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {area.subjects.map((subject) => (
                    <Button
                      key={subject.value}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleAddSubject(index, area.value, subject)
                      }
                    >
                      {subject.label}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() => {
          setChildren([
            ...children,
            {
              name: "",
              educationLevel: "",
              grade: "",
              gender: "",
              ageGroup: "",
              username: "",
              password: "",
              subjects: [],
            },
          ])
          setShowPasswords([...showPasswords, false])
          setChildrenSubjects([...childrenSubjects, []])
        }}
      >
        Add Another Child
      </Button>
    </div>
  )
}

export function ParentSignUpForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [interestedInLearning, setInterestedInLearning] = React.useState(false)
  const [selectedSubjects, setSelectedSubjects] = React.useState<string[]>([])
  const [selectedAreas, setSelectedAreas] = React.useState<string[]>([])
  const [currentStep, setCurrentStep] = React.useState(0)

  const form = useForm<ParentFormData>({
    resolver: zodResolver(parentFormSchema),
    defaultValues: {
      name: "",
      email: "",
      username: "", // Added username default value
      password: "",
      gender: "",
      phone: "",
      interestedInLearning: false,
      children: [{ name: "", gender: "", educationLevel: "", grade: "" }]
    }
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    trigger,
    getValues,
  } = form

  const [children, setChildren] = React.useState<ChildInfo[]>([
    { name: "", educationLevel: "", grade: "", gender: "", ageGroup: "", subjects: [] }
  ])

  const availableSubjects = React.useMemo(() => {
    return selectedAreas.flatMap(area => {
      const foundArea = subjectAreas.find(a => a.value === area)
      return foundArea?.subjects || []
    })
  }, [selectedAreas])

  const handleAreaToggle = (areaValue: string) => {
    setSelectedAreas(current => {
      const isSelected = current.includes(areaValue)
      if (isSelected) {
        const area = subjectAreas.find(a => a.value === areaValue)
        const areaSubjects = area?.subjects.map(s => s.value) || []
        setSelectedSubjects(subs => subs.filter(s => !areaSubjects.includes(s)))
        return current.filter(a => a !== areaValue)
      }
      return [...current, areaValue]
    })
    setValue("subjectAreas", selectedAreas)
  }

  const handleSubjectToggle = (subjectValue: string) => {
    setSelectedSubjects(current => {
      const isSelected = current.includes(subjectValue)
      if (isSelected) {
        return current.filter(s => s !== subjectValue)
      }
      return [...current, subjectValue]
    })
    setValue("subjects", selectedSubjects)
  }

  const handleGradeChange = (value: string, index: number) => {
    const updatedChildren = [...children]
    updatedChildren[index].grade = value
    setChildren(updatedChildren)
  }

  
  const onSubmit = async (data: ParentFormData) => {

    try {
      setIsSubmitting(true);

      const formData = {
        name: data.name,
        email: data.email,
        username: data.username,
        password: data.password,
        role: "parent",
        gender: data.gender,
        phone: data.phone,
        parentProfile: {
          interestedInLearning: data.interestedInLearning,
          educationLevel: data.educationLevel,
          subjects: data.subjects || [],
          children: children.map(child => ({
            name: child.name,
            gender: child.gender,
            grade: child.grade,
            educationLevel: child.educationLevel,
            ageGroup: child.ageGroup,
            username: child.username,
            password: child.password,
            subjects: child.subjects
          }))
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

      toast.success("Account created! Please verify your email to continue.");
      router.push(`/verify-pending?email=${encodeURIComponent(data.email)}`);
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create account");
    } finally {
      setIsSubmitting(false);
    }
  };

  // const handleNext = async () => {
  //   let isValid = false;
    
  //   switch (currentStep) {
  //     case 0:
  //       isValid = await trigger(["name", "email", "password", "gender", "phone"]);
  //       break;
  //     case 1:
  //       isValid = true; // Learning preferences are optional
  //       break;
  //     case 2:
  //       // Validate children array and submit form
  //       setValue("children", children);
  //       isValid = children.length > 0 && children.every(child => 
  //         child.name && child.gender && child.educationLevel && child.grade
  //       );
  //       if (isValid) {
  //         form.handleSubmit(onSubmit)();
  //         return;
  //       }
  //       break;
  //   }

  //   if (isValid) {
  //     setCurrentStep((prev) => prev + 1);
  //   }
  // };

  const handleNext = async () => {
    let isValid = false;
  
    switch (currentStep) {
      case 0:
        isValid = await trigger(["name", "email", "password", "gender", "phone"]);
        break;
      case 1:
        isValid = true;
        break;
      case 2:
        isValid = children.length > 0 && children.every(child =>
          child.name &&
          child.username &&
          child.password &&
          child.gender &&
          child.educationLevel &&
          child.grade
        );
        if (isValid) {
          // Pass merged values manually into onSubmit
          const allValues = getValues(); // all form values
          const merged = {
            ...allValues,
            children, // override children with actual state
          };
          await onSubmit(merged as ParentFormData);
          return;
        }
        break;
    }
  
    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    }
  };
  

  const steps = [
    "Basic Information",
    "Learning Preferences",
    "Children Information",
  ]

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1)
  }

  const renderButtonContent = () => {
    if (currentStep === steps.length - 1) {
      if (isSubmitting) {
        return (
          <>
            <FiLoader className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        )
      }
      return "Create Account"
    }
    return "Next"
  }

  return (
    <div className="w-full max-w-md space-y-6">
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

      <form className="space-y-6">
        {currentStep === 0 && (
          <BasicInfoStep 
            register={register}
            setValue={setValue}
            errors={errors}
            isSubmitting={isSubmitting}
            getValues={getValues}
          />
        )}

        {currentStep === 1 && (
          <LearningPreferencesStep 
            register={register}
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
        )}

        {currentStep === 2 && (
          <ChildrenInfoStep 
            register={register}
            setValue={setValue}
            errors={errors}
            isSubmitting={isSubmitting}
            getValues={getValues}
            children={children}
            setChildren={setChildren}
          />
        )}

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
            {renderButtonContent()}
          </Button>
        </div>
      </form>
    </div>
  )
}
