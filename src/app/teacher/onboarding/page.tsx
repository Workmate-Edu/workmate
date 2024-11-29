"use client";

import { useSession } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useState } from "react";

const subjectOptions = [
  { value: "stem", label: "STEM" },
  { value: "art", label: "Art" },
  { value: "arabic", label: "Arabic" },
] as const;

const formSchema = z.object({
  bio: z.string().min(50, {
    message: "Bio must be at least 50 characters.",
  }),
  subjects: z.array(z.enum(["stem", "art", "arabic"])).min(1, {
    message: "Please select at least one subject.",
  }),
  qualifications: z.array(
    z.object({
      degree: z.string().min(1, "Degree is required"),
      institution: z.string().min(1, "Institution is required"),
      year: z.number().min(1900).max(new Date().getFullYear()),
    })
  ),
  teachingExperience: z.number().min(0, {
    message: "Experience must be a positive number.",
  }),
  hourlyRate: z.number().min(0, {
    message: "Hourly rate must be a positive number.",
  }),
  availability: z.array(
    z.object({
      day: z.enum([
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ]),
      startTime: z.string(),
      endTime: z.string(),
    })
  ),
});

type FormData = z.infer<typeof formSchema>;

export default function TeacherOnboardingPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bio: "",
      subjects: [],
      qualifications: [{ degree: "", institution: "", year: new Date().getFullYear() }],
      teachingExperience: 0,
      hourlyRate: 0,
      availability: [],
    },
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    try {
      const response = await fetch("/api/teacher/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      // Update session with new data
      await update();
      
      // Redirect to dashboard
      router.push("/teacher/dashboard");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Complete Your Teacher Profile</h1>
        <p className="text-muted-foreground">
          Tell us more about yourself and your teaching experience.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us about yourself, your teaching philosophy, and what makes you a great teacher..."
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  This will be displayed on your public profile.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subjects"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subjects</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) => {
                      const currentSubjects = field.value || [];
                      if (!currentSubjects.includes(value as any)) {
                        field.onChange([...currentSubjects, value]);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subjects you teach" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjectOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <div className="flex flex-wrap gap-2 mt-2">
                  {field.value?.map((subject) => (
                    <div
                      key={subject}
                      className="bg-primary/10 text-primary px-2 py-1 rounded-md flex items-center gap-2"
                    >
                      {subject}
                      <button
                        type="button"
                        onClick={() => {
                          field.onChange(
                            field.value?.filter((s) => s !== subject)
                          );
                        }}
                        className="text-primary hover:text-primary/80"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <FormLabel>Qualifications</FormLabel>
            {form.watch("qualifications")?.map((_, index) => (
              <div key={index} className="flex gap-4">
                <FormField
                  control={form.control}
                  name={`qualifications.${index}.degree`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input placeholder="Degree" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`qualifications.${index}.institution`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input placeholder="Institution" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`qualifications.${index}.year`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Year"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const qualifications = form.getValues("qualifications") || [];
                form.setValue("qualifications", [
                  ...qualifications,
                  { degree: "", institution: "", year: new Date().getFullYear() },
                ]);
              }}
            >
              Add Qualification
            </Button>
          </div>

          <FormField
            control={form.control}
            name="teachingExperience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teaching Experience (years)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hourlyRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hourly Rate ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Complete Profile"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
