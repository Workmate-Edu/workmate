"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { educationLevels, gradesByLevel } from "@/lib/constants/education"
import { genderOptions } from "@/lib/constants/general"
import { Badge } from "@/components/ui/badge"
import { X, Eye, EyeOff } from "lucide-react"
import { Label } from "@/components/ui/label"
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

const ageGroupOptions = [
  { value: '3-5', label: '3-5 years' },
  { value: '6-8', label: '6-8 years' },
  { value: '9-11', label: '9-11 years' },
  { value: '12-14', label: '12-14 years' },
  { value: '15-17', label: '15-17 years' },
  { value: '18+', label: '18+ years' },
];

const subjectAreas = [
  { 
    label: "STEM", 
    value: "stem",
    subjects: [
      { label: "Math", value: "math" },
      { label: "Physics", value: "physics" },
      { label: "Chemistry", value: "chemistry" },
      { label: "Biology", value: "biology" },
      { label: "Computer Science", value: "computer_science" },
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

const childFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(10, "Phone number is required"),
  gender: z.string().min(1, "Gender is required"),
  educationLevel: z.string().min(1, "Education level is required"),
  grade: z.string().min(1, "Grade is required"),
  ageGroup: z.string().min(1, "Age group is required"),
  subjects: z.array(z.object({
    area: z.string(),
    name: z.string()
  })).min(1, "At least one subject is required"),
})

type ChildFormData = z.infer<typeof childFormSchema>

interface AddChildFormProps {
  mode?: 'create' | 'edit';
  childId?: string;
}

export function AddChildForm({ mode = 'create', childId }: AddChildFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(true)
  const [selectedSubjects, setSelectedSubjects] = React.useState<Array<{ area: string, name: string }>>([])
  const [showPassword, setShowPassword] = React.useState(false)

  const form = useForm<ChildFormData>({
    resolver: zodResolver(childFormSchema),
    defaultValues: {
      name: "",
      username: "",
      password: "",
      phone: "",
      gender: "",
      educationLevel: "",
      grade: "",
      ageGroup: "",
      subjects: [],
    },
  })

  const handleAddSubject = (area: string, subject: { label: string, value: string }) => {
    setSelectedSubjects(prev => {
      const exists = prev.some(s => s.area === area && s.name === subject.value)
      if (exists) return prev
      const newSubjects = [...prev, { area, name: subject.value }]
      form.setValue("subjects", newSubjects)
      return newSubjects
    })
  }

  const handleRemoveSubject = (area: string, name: string) => {
    setSelectedSubjects(prev => {
      const newSubjects = prev.filter(s => !(s.area === area && s.name === name))
      form.setValue("subjects", newSubjects)
      return newSubjects
    })
  }

  React.useEffect(() => {
    if (mode === 'edit' && childId) {
      const fetchChild = async () => {
        try {
          const response = await fetch(`/api/parent/children/${childId}`)
          const data = await response.json()
          if (!response.ok) throw new Error(data.error)

          const transformedSubjects = data.child.subjects.map((subject: any) => ({
            area: subject.area,
            name: subject.name
          }))

          form.reset({
            name: data.child.name,
            username: data.child.username,
            password: "",
            phone: data.child.phone,
            gender: data.child.gender,
            educationLevel: data.child.educationLevel,
            grade: data.child.grade,
            ageGroup: data.child.ageGroup,
            subjects: transformedSubjects
          })

          setSelectedSubjects(transformedSubjects)
        } catch {
          toast.error("Failed to load child details")
        } finally {
          setIsLoading(false)
        }
      }

      fetchChild()
    } else {
      setIsLoading(false)
    }
  }, [childId, mode, form])

  const onSubmit = async (data: ChildFormData) => {
    try {
      setIsLoading(true)

      const url = mode === 'edit'
        ? `/api/parent/children/${childId}`
        : "/api/parent/children"

      const method = mode === 'edit' ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error)

      toast.success(mode === 'edit' ? "Child updated successfully" : "Child added successfully")
      router.push("/dashboard/parent")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save child")
    } finally {
      setIsLoading(false)
    }
  }

  if (mode === 'edit' && isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Input placeholder="Child's Name" {...form.register("name")} />
      {form.formState.errors.name && <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>}

      <Input placeholder="Child's Username" {...form.register("username")} />
      {form.formState.errors.username && <p className="text-sm text-red-500">{form.formState.errors.username.message}</p>}

      <div>
        <Label>Phone Number</Label>
        <div className="relative">
          <PhoneInput
            country={'ng'}
            inputProps={{
              name: 'phone',
              required: true,
            }}
            onChange={(value) => form.setValue('phone', `+${value}`)}
            disabled={isLoading}
            containerClass="w-full"
            inputClass="!pl-14 !w-full !h-10 !text-sm !rounded-md !border !border-input !bg-background !text-foreground"
            buttonClass="!border-0 !bg-transparent !absolute !left-3 !top-1/2 !-translate-y-1/2 z-10"
            dropdownClass="!bg-white !text-black !z-[1000]"
          />
          {form.formState.errors.phone && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.phone.message}</p>
          )}
        </div>
      </div>

      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          placeholder="Child's Password"
          {...form.register("password")}
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {form.formState.errors.password && <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>}

      <Select onValueChange={(value) => form.setValue("ageGroup", value)}>
        <SelectTrigger><SelectValue placeholder="Select age group" /></SelectTrigger>
        <SelectContent>
          {ageGroupOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select onValueChange={(value) => form.setValue("gender", value)}>
        <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
        <SelectContent>
          {genderOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select onValueChange={(value) => {
        form.setValue("educationLevel", value)
        form.setValue("grade", "")
      }}>
        <SelectTrigger><SelectValue placeholder="Select education level" /></SelectTrigger>
        <SelectContent>
          {educationLevels.map(level => (
            <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {form.watch("educationLevel") && (
        <Select onValueChange={(value) => form.setValue("grade", value)}>
          <SelectTrigger><SelectValue placeholder="Select grade" /></SelectTrigger>
          <SelectContent>
            {gradesByLevel[form.watch("educationLevel") as keyof typeof gradesByLevel]?.map(grade => (
              <SelectItem key={grade.value} value={grade.value}>{grade.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <div className="space-y-4">
        <Label>Subjects</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedSubjects.map(subject => {
            const areaData = subjectAreas.find(a => a.value === subject.area)
            const subjectData = areaData?.subjects.find(s => s.value === subject.name)
            return (
              <Badge key={`${subject.area}-${subject.name}`} variant="secondary">
                {subjectData?.label}
                <button type="button" className="ml-1" onClick={() => handleRemoveSubject(subject.area, subject.name)}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )
          })}
        </div>

        {subjectAreas.map(area => (
          <div key={area.value} className="space-y-2">
            <h3 className="text-sm font-medium">{area.label}</h3>
            <div className="flex flex-wrap gap-2">
              {area.subjects.map(subject => (
                <Button
                  key={subject.value}
                  type="button"
                  variant="outline"
                  size="sm"
                  className={selectedSubjects.some(s => s.area === area.value && s.name === subject.value) ? 'bg-primary/10' : ''}
                  onClick={() => handleAddSubject(area.value, subject)}
                >
                  {subject.label}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (mode === 'edit' ? "Updating..." : "Adding...") : (mode === 'edit' ? "Update Child" : "Add Child")}
      </Button>
    </form>
  )
}
