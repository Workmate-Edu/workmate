"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Progress } from "@/components/ui/progress"
import { Card } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, ChevronRight, ChevronLeft } from "lucide-react"

const questions = [
  {
    category: "Learning Environment",
    questions: [
      {
        id: "study_environment",
        question: "What type of environment does your child prefer for studying?",
        type: "radio",
        options: [
          "Quiet and isolated",
          "Instructor led",
          "In a group setting",
          "Varies depending on task"
        ]
      },
      {
        id: "concentration_duration",
        question: "How long can your child typically concentrate on a single task?",
        type: "radio",
        options: [
          "Less than 15 minutes",
          "15-30 minutes",
          "30-45 minutes",
          "More than 45 minutes"
        ]
      }
    ]
  },
  {
    category: "Learning Preferences",
    questions: [
      {
        id: "preferred_learning_method",
        question: "How does your child prefer to learn new information?",
        type: "checkbox",
        options: [
          "Visual (pictures, videos)",
          "Auditory (listening, discussing)",
          "Reading/Writing",
          "Hands-on activities"
        ]
      },
      {
        id: "motivation_factors",
        question: "What motivates your child to learn?",
        type: "checkbox",
        options: [
          "Personal interest",
          "Achievement/grades",
          "Rewards/recognition",
          "Social interaction",
          "Practical applications"
        ]
      }
    ]
  },
  {
    category: "Academic Challenges",
    questions: [
      {
        id: "difficult_subjects",
        question: "Which subjects does your child find most challenging?",
        type: "textarea"
      },
      {
        id: "support_needed",
        question: "What type of support do you think would be most beneficial?",
        type: "radio",
        options: [
          "One-on-one tutoring",
          "Group study sessions",
          "Additional practice materials",
          "Interactive learning tools"
        ]
      }
    ]
  },
  {
    category: "Goals and Expectations",
    questions: [
      {
        id: "short_term_goals",
        question: "What are your short-term academic goals for your child?",
        type: "textarea"
      },
      {
        id: "long_term_goals",
        question: "What are your long-term educational goals for your child?",
        type: "textarea"
      }
    ]
  }
]

// Add validation schemas for each question type
const getQuestionValidation = (question) => {
  switch (question.type) {
    case "radio":
      return z.string().min(1, "Please select an option");
    case "checkbox":
      return z.array(z.string()).min(1, "Please select at least one option");
    case "textarea":
      return z.string().min(1, "This field is required");
    default:
      return z.string().optional();
  }
};

const assessmentSchema = z.object({
  responses: z.array(
    z.object({
      category: z.string(),
      questions: z.array(
        z.object({
          questionId: z.string(),
          question: z.string(),
          type: z.string(),
          answer: z.any(),
          notes: z.string().optional(),
        })
      ),
    })
  ),
});

interface ParentAssessmentFormProps {
  childId: string;
  initialData?: any;
  mode?: 'create' | 'edit';
  onSuccess?: () => void;
}

export function ParentAssessmentForm({ 
  childId, 
  initialData, 
  mode = 'create',
  onSuccess 
}: ParentAssessmentFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = React.useState(0)
  const [progress, setProgress] = React.useState(0)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Initialize form values with proper structure
  const [formValues, setFormValues] = React.useState<any>(() => {
    if (mode === 'edit' && initialData?.responses) {
      // Map existing data to match our structure
      return {
        responses: questions.map((category) => {
          const matchingCategory = initialData.responses.find(
            (r: any) => r.category === category.category
          );

          return {
            category: category.category,
            questions: category.questions.map((q) => {
              const matchingQuestion = matchingCategory?.questions?.find(
                (mq: any) => mq.questionId === q.id
              );

              return {
                questionId: q.id,
                question: q.question,
                type: q.type,
                answer: matchingQuestion?.answer || "",
                notes: matchingQuestion?.notes || ""
              };
            })
          };
        })
      };
    }

    // Default structure for new assessments
    return {
      responses: questions.map((category) => ({
        category: category.category,
        questions: category.questions.map((question) => ({
          questionId: question.id,
          question: question.question,
          type: question.type,
          answer: "",
          notes: ""
        }))
      }))
    };
  });

  // Add validation state
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const currentCategory = questions[currentStep];

  // Calculate total progress
  const totalSteps = questions.length;
  const currentProgress = ((currentStep + 1) / totalSteps) * 100;

  // Calculate if we're on the last question section
  const isLastSection = currentStep === questions.length - 1;
  
  // Calculate if we're on the review step
  const isReviewStep = currentStep === questions.length;

  const validateCurrentStep = () => {
    const currentQuestions = questions[currentStep].questions;
    const currentResponses = formValues.responses[currentStep].questions;
    const newErrors: Record<string, string> = {};
    let isValid = true;

    currentQuestions.forEach((question, index) => {
      const response = currentResponses[index];
      const answer = response.answer;

      // Skip validation for optional fields
      if (question.optional) {
        return;
      }

      switch (question.type) {
        case "radio":
          if (!answer) {
            newErrors[question.id] = "Please select an option";
            isValid = false;
          }
          break;
        case "checkbox":
          if (!Array.isArray(answer) || answer.length === 0) {
            newErrors[question.id] = "Please select at least one option";
            isValid = false;
          }
          break;
        case "textarea":
          if (!answer || answer.trim() === "") {
            newErrors[question.id] = "This field is required";
            isValid = false;
          }
          break;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (isLastSection) {
      setCurrentStep(questions.length); // Set to review step
      setProgress(100); // Keep at 100% for review step
    } else if (currentStep < questions.length) {
      setCurrentStep(currentStep + 1);
      // Calculate progress based on current step
      setProgress(((currentStep + 2) / totalSteps) * 100);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      // Calculate progress based on current step, but never exceed 100%
      const newProgress = ((currentStep) / totalSteps) * 100;
      setProgress(Math.min(newProgress, 100));
    }
  };

  const handleChange = (questionIndex: number, value: any, notes: string = "") => {
    setFormValues(prevValues => {
      const newResponses = [...prevValues.responses];
      const newQuestions = [...newResponses[currentStep].questions];
      newQuestions[questionIndex] = {
        ...newQuestions[questionIndex],
        answer: value,
        notes: notes
      };
      newResponses[currentStep] = {
        ...newResponses[currentStep],
        questions: newQuestions
      };
      return { ...prevValues, responses: newResponses };
    });
  };

  const formatAssessmentData = () => {
    return {
      responses: questions.map((category, categoryIndex) => ({
        category: category.category,
        questions: formValues.responses[categoryIndex].questions.map(q => ({
          questionId: q.questionId,
          question: q.question,
          type: q.type,
          answer: q.type === 'checkbox' 
            ? (Array.isArray(q.answer) ? q.answer : [])
            : (q.answer || ''),
          notes: q.notes || ''
        }))
      }))
    };
  };

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      const url = `/api/parent/children/${childId}/assessment`;
      
      const response = await fetch(url, {
        method: mode === 'edit' ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses: data })
      });

      if (!response.ok) {
        throw new Error('Failed to submit assessment');
      }

      toast.success(
        mode === 'edit' 
          ? 'Assessment updated successfully' 
          : 'Assessment submitted successfully'
      );
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to submit assessment');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitForm = async () => {
    try {
      setIsSubmitting(true);
      const assessmentData = formatAssessmentData();
      
      const response = await fetch(`/api/parent/children/${childId}/assessment`, {
        method: mode === 'edit' ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assessmentData),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to submit assessment');
      }

      toast.success(mode === 'edit' ? 'Assessment updated successfully!' : 'Assessment submitted successfully!');
      
      if (mode === 'edit') {
        onSuccess?.(); // Call the success callback to close modal and refresh data
      } else {
        router.push(`/dashboard/parent/children/${childId}`);
        router.refresh();
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestion = (question, questionIndex) => {
    const currentValue = formValues?.responses?.[currentStep]?.questions?.[questionIndex]?.answer ?? "";
    const hasError = errors[question.id];

    const QuestionLabel = () => (
      <Label 
        htmlFor={question.id} 
        className="text-sm font-medium flex items-start gap-1 mb-2"
      >
        <span>{question.question}</span>
        <span className="text-red-500">*</span>
      </Label>
    );

    switch (question.type) {
      case "radio":
        return (
          <div className="space-y-3">
            <QuestionLabel />
            <RadioGroup
              onValueChange={(value) => handleChange(questionIndex, value)}
              defaultValue={currentValue}
            >
              {question.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                  <Label htmlFor={`${question.id}-${option}`} className="text-sm">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {hasError && (
              <p className="text-sm text-red-500">{hasError}</p>
            )}
          </div>
        );

      case "checkbox":
        return (
          <div className="space-y-3">
            <QuestionLabel />
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${option}`}
                  checked={Array.isArray(currentValue) && currentValue.includes(option)}
                  onCheckedChange={(checked) => {
                    const newValues = Array.isArray(currentValue) ? [...currentValue] : [];
                    if (checked) {
                      newValues.push(option);
                    } else {
                      newValues.splice(newValues.indexOf(option), 1);
                    }
                    handleChange(questionIndex, newValues);
                  }}
                />
                <Label htmlFor={`${question.id}-${option}`} className="text-sm">
                  {option}
                </Label>
              </div>
            ))}
            {hasError && (
              <p className="text-sm text-red-500">{hasError}</p>
            )}
          </div>
        );

      case "textarea":
        return (
          <div className="space-y-3">
            <QuestionLabel />
            <Textarea
              id={question.id}
              placeholder="Enter your response..."
              value={currentValue || ''}
              onChange={(e) => handleChange(questionIndex, e.target.value)}
            />
            {hasError && (
              <p className="text-sm text-red-500">{hasError}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // Add review step rendering
  const renderReviewStep = () => (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">Review Your Responses</h3>
      <div className="space-y-6">
        {questions.map((category, categoryIndex) => (
          <div key={category.category} className="border-b pb-4 last:border-0">
            <h4 className="font-medium text-lg mb-3">{category.category}</h4>
            <div className="space-y-4">
              {category.questions.map((question, questionIndex) => {
                const response = formValues.responses[categoryIndex].questions[questionIndex];
                return (
                  <div key={question.id} className="pl-4 border-l-2 border-muted">
                    <p className="font-medium text-sm">{question.question}</p>
                    <p className="text-sm mt-1">
                      {Array.isArray(response.answer) 
                        ? response.answer.join(", ") 
                        : response.answer || "No answer provided"}
                    </p>
                    {response.notes && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Note: {response.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
      <div className="space-y-2 mb-6">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>{Math.min(Math.round(currentProgress), 100)}%</span>
        </div>
        <Progress value={Math.min(currentProgress, 100)} className="h-2" />
      </div>

      {isReviewStep ? renderReviewStep() : (
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">{currentCategory.category}</h3>
          <div className="space-y-6">
            {currentCategory.questions.map((question, questionIndex) => (
              <div key={question.id} className="space-y-4">
                {renderQuestion(question, questionIndex)}
                <div className="pt-2">
                  <Label className="text-sm text-muted-foreground mb-2">
                    Additional Notes (Optional)
                  </Label>
                  <Textarea
                    placeholder="Add any additional comments..."
                    value={formValues.responses[currentStep].questions[questionIndex].notes || ''}
                    onChange={(e) => {
                      handleChange(
                        questionIndex, 
                        formValues.responses[currentStep].questions[questionIndex].answer,
                        e.target.value
                      );
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0 || isSubmitting}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {isReviewStep ? (
          // Submit button that appears on review step
          <Button 
            onClick={handleSubmitForm}  // Changed to onClick instead of type="submit"
            type="button"               // Make it type="button" to prevent form submission
            disabled={isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <span className="animate-pulse">Submitting...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                {mode === 'edit' ? 'Update Assessment' : 'Submit Assessment'}
              </>
            )}
          </Button>
        ) : (
          // Navigation button for questions and review
          <Button 
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
          >
            {isLastSection ? 'Review Answers' : 'Next'} 
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </form>
  );
}
