"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

const days = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
] as const;

const subjects = [
  { value: "stem", label: "STEM" },
  { value: "art", label: "Art" },
  { value: "arabic", label: "Arabic" },
] as const;

const formSchema = z.object({
  subjects: z.array(z.string()).min(1, {
    message: "Please select at least one subject.",
  }),
  preferredDays: z.array(z.string()).min(1, {
    message: "Please select at least one day.",
  }),
  preferredTimes: z.array(
    z.object({
      start: z.string(),
      end: z.string(),
    })
  ).min(1, {
    message: "Please add at least one time slot.",
  }),
  maxPrice: z.number().min(0, {
    message: "Price must be a positive number.",
  }),
  languages: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function TeacherPreferencesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const learningStyle = searchParams.get("style");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subjects: [],
      preferredDays: [],
      preferredTimes: [{ start: "09:00", end: "17:00" }],
      maxPrice: 50,
      languages: [],
    },
  });

  async function onSubmit(data: FormData) {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/matching", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          preferences: data,
          learningStyle: JSON.parse(learningStyle || "{}"),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to find matches");
      }

      const matches = await response.json();
      router.push("/student/find-teacher/matches?data=" + encodeURIComponent(JSON.stringify(matches)));
    } catch (error) {
      console.error("Error:", error);
      // Handle error appropriately
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-bold">Your Teaching Preferences</h1>
        <p className="text-muted-foreground">
          Help us find the perfect teacher by telling us your preferences.
        </p>
      </div>

      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="subjects"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subjects</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 gap-4">
                      {subjects.map((subject) => (
                        <div key={subject.value} className="flex items-center space-x-2">
                          <Checkbox
                            checked={field.value?.includes(subject.value)}
                            onCheckedChange={(checked) => {
                              const value = field.value || [];
                              if (checked) {
                                field.onChange([...value, subject.value]);
                              } else {
                                field.onChange(value.filter((v) => v !== subject.value));
                              }
                            }}
                          />
                          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {subject.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preferredDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Days</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 gap-4">
                      {days.map((day) => (
                        <div key={day.value} className="flex items-center space-x-2">
                          <Checkbox
                            checked={field.value?.includes(day.value)}
                            onCheckedChange={(checked) => {
                              const value = field.value || [];
                              if (checked) {
                                field.onChange([...value, day.value]);
                              } else {
                                field.onChange(value.filter((v) => v !== day.value));
                              }
                            }}
                          />
                          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {day.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormLabel>Preferred Times</FormLabel>
              {form.watch("preferredTimes")?.map((_, index) => (
                <div key={index} className="flex gap-4">
                  <FormField
                    control={form.control}
                    name={`preferredTimes.${index}.start`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`preferredTimes.${index}.end`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input type="time" {...field} />
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
                  const times = form.getValues("preferredTimes") || [];
                  form.setValue("preferredTimes", [
                    ...times,
                    { start: "09:00", end: "17:00" },
                  ]);
                }}
              >
                Add Time Slot
              </Button>
            </div>

            <FormField
              control={form.control}
              name="maxPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Price per Hour ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Finding Teachers...
                </>
              ) : (
                "Find Teachers"
              )}
            </Button>
          </form>
        </Form>
      </Card>
    </div>
  );
}
