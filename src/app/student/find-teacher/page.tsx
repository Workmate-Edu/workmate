"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { questions } from "@/lib/matching/learning-style";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function FindTeacherPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: string; selectedType: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const progress = (currentStep / questions.length) * 100;

  const handleAnswer = async (questionId: string, selectedType: string) => {
    const newAnswers = [...answers, { questionId, selectedType }];
    setAnswers(newAnswers);

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsSubmitting(true);
      try {
        const response = await fetch("/api/matching", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            learningStyleAnswers: newAnswers,
            preferences: {
              // We'll collect these in the next step
              subjects: [],
              preferredDays: [],
              preferredTimes: [],
              maxPrice: 0,
            },
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to submit answers");
        }

        // Navigate to preferences page with learning style data
        const data = await response.json();
        router.push("/student/find-teacher/preferences?style=" + encodeURIComponent(JSON.stringify(data.learningStyle)));
      } catch (error) {
        console.error("Error:", error);
        // Handle error appropriately
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-bold">Find Your Perfect Teacher</h1>
        <p className="text-muted-foreground">
          Let's understand your learning style to match you with the right teacher.
        </p>
        <Progress value={progress} className="h-2" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  {questions[currentStep].text}
                </h2>
                <div className="grid gap-4">
                  {questions[currentStep].options.map((option) => (
                    <Button
                      key={option.type}
                      variant="outline"
                      className="justify-start h-auto p-4 text-left"
                      onClick={() => handleAnswer(questions[currentStep].id, option.type)}
                      disabled={isSubmitting}
                    >
                      {option.text}
                    </Button>
                  ))}
                </div>
              </div>

              {isSubmitting && (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Analyzing your learning style...</span>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="mt-4 text-center text-sm text-muted-foreground">
        Question {currentStep + 1} of {questions.length}
      </div>
    </div>
  );
}
