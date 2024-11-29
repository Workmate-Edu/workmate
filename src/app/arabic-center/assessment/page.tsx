"use client"

import { useState } from "react"
import { 
  Check,
  ChevronRight,
  GraduationCap,
  Loader2,
  RefreshCcw
} from "lucide-react"
import Link from "next/link"

const assessmentQuestions = {
  quran: [
    {
      question: "What is your current level in Quran reading?",
      questionAr: "ما هو مستواك في قراءة القرآن؟",
      options: [
        { label: "Beginner - Learning letters", labelAr: "مبتدئ - تعلم الحروف" },
        { label: "Can read with difficulty", labelAr: "يمكنني القراءة مع الصعوبة" },
        { label: "Can read fluently", labelAr: "يمكنني القراءة بطلاقة" },
        { label: "Can read with tajweed", labelAr: "يمكنني القراءة مع التجويد" }
      ]
    },
    {
      question: "Have you memorized any parts of the Quran?",
      questionAr: "هل حفظت أجزاء من القرآن؟",
      options: [
        { label: "No memorization yet", labelAr: "لم أحفظ بعد" },
        { label: "Few short surahs", labelAr: "بعض السور القصيرة" },
        { label: "Multiple juz", labelAr: "عدة أجزاء" },
        { label: "Hafiz of the Quran", labelAr: "حافظ للقرآن" }
      ]
    }
  ],
  grammar: [
    {
      question: "What is your understanding of Arabic grammar?",
      questionAr: "ما هو فهمك للنحو العربي؟",
      options: [
        { label: "Complete beginner", labelAr: "مبتدئ تماماً" },
        { label: "Basic understanding", labelAr: "فهم أساسي" },
        { label: "Intermediate level", labelAr: "مستوى متوسط" },
        { label: "Advanced level", labelAr: "مستوى متقدم" }
      ]
    },
    {
      question: "Can you identify grammatical cases (إعراب)?",
      questionAr: "هل يمكنك تحديد الإعراب؟",
      options: [
        { label: "Not at all", labelAr: "لا على الإطلاق" },
        { label: "Basic cases only", labelAr: "الحالات الأساسية فقط" },
        { label: "Most cases", labelAr: "معظم الحالات" },
        { label: "All cases confidently", labelAr: "جميع الحالات بثقة" }
      ]
    }
  ],
  morphology: [
    {
      question: "Can you identify word patterns (أوزان)?",
      questionAr: "هل يمكنك تحديد الأوزان؟",
      options: [
        { label: "Not familiar", labelAr: "غير مألوف" },
        { label: "Know basic patterns", labelAr: "أعرف الأوزان الأساسية" },
        { label: "Familiar with most", labelAr: "مألوف مع معظمها" },
        { label: "Advanced understanding", labelAr: "فهم متقدم" }
      ]
    }
  ],
  writing: [
    {
      question: "How well can you write Arabic?",
      questionAr: "ما مدى إتقانك للكتابة العربية؟",
      options: [
        { label: "Cannot write yet", labelAr: "لا أستطيع الكتابة بعد" },
        { label: "Basic writing", labelAr: "كتابة أساسية" },
        { label: "Good writing skills", labelAr: "مهارات كتابة جيدة" },
        { label: "Excellent writing", labelAr: "كتابة ممتازة" }
      ]
    }
  ]
}

interface AssessmentState {
  [key: string]: {
    [key: number]: number
  }
}

export default function AssessmentPage() {
  const [currentSection, setCurrentSection] = useState("quran")
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<AssessmentState>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<Record<string, string> | null>(null)

  const sections = Object.keys(assessmentQuestions)
  const currentQuestions = assessmentQuestions[currentSection as keyof typeof assessmentQuestions]
  const currentQuestion = currentQuestions[currentQuestionIndex]

  const handleAnswer = (answer: number) => {
    setAnswers({
      ...answers,
      [currentSection]: {
        ...answers[currentSection],
        [currentQuestionIndex]: answer
      }
    })

    // Move to next question or section
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      const currentSectionIndex = sections.indexOf(currentSection)
      if (currentSectionIndex < sections.length - 1) {
        setCurrentSection(sections[currentSectionIndex + 1])
        setCurrentQuestionIndex(0)
      } else {
        handleSubmit()
      }
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Calculate recommendations based on answers
    const recommendations = {
      quran: answers.quran?.[0] === 0 ? "Quranic Reading & Tajweed" : "Quranic Memorization",
      grammar: answers.grammar?.[0] <= 1 ? "Foundational Arabic Grammar" : "Advanced Grammar Studies",
      morphology: answers.morphology?.[0] <= 1 ? "Introduction to Sarf" : "Advanced Morphology",
      writing: answers.writing?.[0] <= 1 ? "Arabic Writing Fundamentals" : "Advanced Writing & Style"
    }

    setResult(recommendations)
    setIsSubmitting(false)
  }

  const handleReset = () => {
    setCurrentSection("quran")
    setCurrentQuestionIndex(0)
    setAnswers({})
    setResult(null)
  }

  if (result) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container py-16">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg border p-8">
              <div className="text-center mb-8">
                <GraduationCap className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Your Assessment Results</h2>
                <p className="text-muted-foreground">
                  Based on your answers, here are our recommended courses:
                </p>
              </div>

              <div className="space-y-6">
                {Object.entries(result).map(([category, course]) => (
                  <div key={category} className="flex items-start gap-4">
                    <Check className="w-5 h-5 text-emerald-600 mt-1" />
                    <div>
                      <h3 className="font-semibold capitalize">{category}</h3>
                      <p className="text-sm text-muted-foreground">{course}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-4">
                <Link
                  href="/arabic-center/courses"
                  className="inline-flex w-full items-center justify-center rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 transition-colors"
                >
                  View Recommended Courses
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
                <button
                  onClick={handleReset}
                  className="inline-flex w-full items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Retake Assessment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="bg-white border-b">
        <div className="container py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">
              Arabic Level Assessment
              <span className="block text-2xl font-arabic text-emerald-700 mt-2">
                تقييم المستوى العربي
              </span>
            </h1>
            <p className="text-muted-foreground">
              Answer a few questions to help us understand your current level and recommend the most suitable courses
            </p>
          </div>
        </div>
      </section>

      {/* Assessment Form */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            {/* Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span className="capitalize">{currentSection}</span>
                <span>
                  Question {currentQuestionIndex + 1} of {currentQuestions.length}
                </span>
              </div>
              <div className="h-2 bg-emerald-100 rounded-full">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all"
                  style={{
                    width: `${
                      ((sections.indexOf(currentSection) * 100) / sections.length) +
                      ((currentQuestionIndex + 1) * 100) / (sections.length * currentQuestions.length)
                    }%`
                  }}
                />
              </div>
            </div>

            {/* Question */}
            <div className="bg-white rounded-lg border p-8">
              {isSubmitting ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Analyzing your responses...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">{currentQuestion.question}</h2>
                    <p className="text-emerald-700 font-arabic">{currentQuestion.questionAr}</p>
                  </div>

                  <div className="space-y-4">
                    {currentQuestion.options.map((option, index) => (
                      <button
                        key={index}
                        className="w-full text-left p-4 rounded-lg border hover:border-emerald-600 hover:bg-emerald-50 transition-colors"
                        onClick={() => handleAnswer(index)}
                      >
                        <div className="font-medium mb-1">{option.label}</div>
                        <div className="text-emerald-700 font-arabic">{option.labelAr}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
