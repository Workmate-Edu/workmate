"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Toast, ToastAction } from "@/components/ui/toast"

const subjects = [
  // STEM Subjects
  { id: "mathematics", label: "Mathematics", category: "STEM" },
  { id: "physics", label: "Physics", category: "STEM" },
  { id: "chemistry", label: "Chemistry", category: "STEM" },
  { id: "biology", label: "Biology", category: "STEM" },
  { id: "computer_science", label: "Computer Science", category: "STEM" },
  { id: "robotics", label: "Robotics", category: "STEM" },
  
  // Business/Entrepreneurship Subjects
  { id: "business_basics", label: "Business Basics", category: "Business" },
  { id: "entrepreneurship", label: "Entrepreneurship", category: "Business" },
  { id: "financial_literacy", label: "Financial Literacy", category: "Business" },
  { id: "marketing", label: "Marketing", category: "Business" },
  
  // African Languages
  { id: "hausa", label: "Hausa", category: "African Languages" },
  { id: "yoruba", label: "Yoruba", category: "African Languages" },
  { id: "igbo", label: "Igbo", category: "African Languages" },
  { id: "swahili", label: "Swahili", category: "African Languages" },
  { id: "english", label: "English", category: "African Languages" }, // Including English as it's widely used in Africa
  
  // Arabic Center Subjects
  { id: "arabic_language", label: "Arabic Language", category: "Arabic" },
  { id: "quran_studies", label: "Qur'an Studies", category: "Arabic" },
  { id: "islamic_studies", label: "Islamic Studies", category: "Arabic" },
  { id: "arabic_culture", label: "Arabic Culture & Heritage", category: "Arabic" },
] as const

const formSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Please enter a valid date in YYYY-MM-DD format.",
  }),
  grade: z.string({
    required_error: "Please select a grade.",
  }),
  studentId: z.string().min(1, {
    message: "Student ID is required.",
  }),
  schoolName: z.string().min(2, {
    message: "School name must be at least 2 characters.",
  }),
  subjects: z.array(z.string()).min(1, {
    message: "Please select at least one subject of interest.",
  }),
  emailOption: z.enum(["existing", "generate"], {
    required_error: "Please select an email option.",
  }),
  email: z.string().email().optional().or(z.literal('')),
})

export default function AddChildPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [emailOption, setEmailOption] = useState<"existing" | "generate">("generate")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      grade: "",
      studentId: "",
      schoolName: "",
      subjects: [],
      emailOption: "generate",
      email: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await fetch('/api/parent/children', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const data = await response.json();
      console.log('Child added successfully:', data);
      
      // Show success message using toast
      toast({
        title: "Success!",
        description: "Child added successfully. Check your email for their login details.",
      });

      // Navigate back to children list
      router.push('/dashboard/parent/children');
    } catch (error) {
      console.error('Error adding child:', error);
      // Show error message using toast
      toast({
        title: "Error",
        description: "Failed to add child. Please try again.",
        variant: "destructive",
      });
    }
  }

  // Group subjects by category
  const subjectsByCategory = subjects.reduce((acc, subject) => {
    if (!acc[subject.category]) {
      acc[subject.category] = [];
    }
    acc[subject.category].push(subject);
    return acc;
  }, {} as Record<string, typeof subjects[number][]>);

  return (
    <div className="flex justify-center py-8 bg-gray-50">
      <div className="w-full max-w-4xl p-8 bg-white rounded-lg shadow-md">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Add New Child</h2>
          <p className="text-gray-600 mt-2">Enter your child's information below</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Personal Information Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Personal Information</h3>
              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter first name" className="w-full" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter last name" className="w-full" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" className="w-full" {...field} />
                      </FormControl>
                      <FormDescription>
                        Your child's date of birth
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="grade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a grade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((grade) => (
                            <SelectItem key={grade} value={grade.toString()}>
                              Grade {grade}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* School Information Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">School Information</h3>
              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="studentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter student ID" className="w-full" {...field} />
                      </FormControl>
                      <FormDescription>
                        The student ID assigned by the school
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="schoolName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter school name" className="w-full" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Email Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Email Settings</h3>
              <FormField
                control={form.control}
                name="emailOption"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Email Option</FormLabel>
                    <FormControl>
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="existing"
                            value="existing"
                            checked={field.value === "existing"}
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              setEmailOption(e.target.value as "existing" | "generate");
                            }}
                            className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                          />
                          <label htmlFor="existing" className="text-sm font-medium">
                            My child has an email address
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="generate"
                            value="generate"
                            checked={field.value === "generate"}
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              setEmailOption(e.target.value as "existing" | "generate");
                            }}
                            className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                          />
                          <label htmlFor="generate" className="text-sm font-medium">
                            Generate an email address for my child
                          </label>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {emailOption === "existing" && (
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Child's Email Address</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="child@example.com" 
                          className="w-full" 
                          {...field} 
                          onChange={(e) => {
                            field.onChange(e);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Subjects Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Areas of Interest</h3>
              <FormField
                control={form.control}
                name="subjects"
                render={() => (
                  <FormItem>
                    <FormDescription className="mb-6">
                      Select the subjects your child is interested in learning
                    </FormDescription>
                    <div className="grid grid-cols-2 gap-8">
                      {Object.entries(subjectsByCategory).map(([category, categorySubjects]) => (
                        <div key={category} className="space-y-4">
                          <h4 className="text-lg font-medium">{category}</h4>
                          <div className="grid gap-3">
                            {categorySubjects.map((subject) => (
                              <FormField
                                key={subject.id}
                                control={form.control}
                                name="subjects"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={subject.id}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(subject.id)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, subject.id])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== subject.id
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        {subject.label}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator className="my-8" />
            
            <div className="flex justify-center">
              <Button type="submit" size="lg" className="w-1/3 py-6 text-lg">
                Add Child
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
