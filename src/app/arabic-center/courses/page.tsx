"use client"

import { 
  BookOpen, 
  BookText, 
  Clock, 
  GraduationCap, 
  PenTool, 
  ScrollText, 
  Trophy, 
  Users 
} from "lucide-react"
import Link from "next/link"

interface Course {
  title: string
  titleAr: string
  level: string
  duration: string
  students: number
  description: string
  features: string[]
}

interface CategoryType {
  id: number
  category: string
  categoryEn: string
  icon: any
  courses: Course[]
}

const courses: CategoryType[] = [
  {
    id: 1,
    category: "القرآن",
    categoryEn: "Quran",
    icon: BookOpen,
    courses: [
      {
        title: "Quranic Reading & Tajweed",
        titleAr: "القراءة والتجويد",
        level: "Beginner to Advanced",
        duration: "32 weeks",
        students: 120,
        description: "Master Quranic recitation with proper Tajweed rules following the Hafs reading",
        features: ["Proper pronunciation", "Tajweed rules", "Memorization techniques"]
      },
      {
        title: "Quranic Memorization",
        titleAr: "حفظ القرآن",
        level: "All Levels",
        duration: "Flexible",
        students: 85,
        description: "Structured program for memorizing the Quran with certified teachers",
        features: ["Personalized pace", "Regular revision", "Ijazah path available"]
      }
    ]
  },
  {
    id: 2,
    category: "النحو",
    categoryEn: "Grammar",
    icon: BookText,
    courses: [
      {
        title: "Foundational Arabic Grammar",
        titleAr: "أساسيات النحو",
        level: "Beginner",
        duration: "16 weeks",
        students: 150,
        description: "Essential Arabic grammar following the traditional method of learning",
        features: ["Basic sentence structure", "Parts of speech", "Case endings"]
      },
      {
        title: "Advanced Grammar Studies",
        titleAr: "النحو المتقدم",
        level: "Advanced",
        duration: "24 weeks",
        students: 65,
        description: "In-depth study of Arabic grammar through classical texts",
        features: ["Complex structures", "Classical texts", "Detailed analysis"]
      }
    ]
  },
  {
    id: 3,
    category: "الصرف",
    categoryEn: "Morphology",
    icon: ScrollText,
    courses: [
      {
        title: "Introduction to Sarf",
        titleAr: "مقدمة في الصرف",
        level: "Beginner",
        duration: "12 weeks",
        students: 95,
        description: "Learn the basics of Arabic word patterns and derivations",
        features: ["Word patterns", "Root system", "Basic derivatives"]
      },
      {
        title: "Advanced Morphology",
        titleAr: "الصرف المتقدم",
        level: "Advanced",
        duration: "20 weeks",
        students: 45,
        description: "Master complex word formations and irregular patterns",
        features: ["Irregular verbs", "Advanced patterns", "Detailed etymology"]
      }
    ]
  },
  {
    id: 4,
    category: "الإملاء",
    categoryEn: "Writing",
    icon: PenTool,
    courses: [
      {
        title: "Arabic Writing Fundamentals",
        titleAr: "أساسيات الكتابة العربية",
        level: "Beginner",
        duration: "8 weeks",
        students: 110,
        description: "Master Arabic script and basic writing rules",
        features: ["Letter forms", "Connections", "Basic rules"]
      },
      {
        title: "Advanced Writing & Style",
        titleAr: "الكتابة المتقدمة",
        level: "Advanced",
        duration: "16 weeks",
        students: 55,
        description: "Perfect your Arabic writing style and composition",
        features: ["Composition", "Styling", "Advanced rules"]
      }
    ]
  }
]

export default function CoursesPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="bg-white border-b">
        <div className="container py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">
              Our Arabic Courses
              <span className="block text-2xl font-arabic text-emerald-700 mt-2">
                دوراتنا العربية
              </span>
            </h1>
            <p className="text-muted-foreground">
              Comprehensive courses designed to build strong foundations in Arabic language through traditional methods
            </p>
          </div>
        </div>
      </section>

      {/* Course Categories */}
      <section className="py-16">
        <div className="container">
          <div className="space-y-16">
            {courses.map((category) => {
              const Icon = category.icon
              return (
                <div key={category.id} className="space-y-8">
                  <div className="flex items-center gap-3">
                    <Icon className="w-8 h-8 text-emerald-700" />
                    <h2 className="text-2xl font-bold">
                      {category.categoryEn}
                      <span className="text-emerald-700 font-arabic mr-2"> {category.category}</span>
                    </h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    {category.courses.map((course, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-lg border p-6 hover:shadow-lg transition-shadow"
                      >
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-lg font-semibold mb-1">
                              {course.title}
                            </h3>
                            <p className="text-emerald-700 font-arabic">
                              {course.titleAr}
                            </p>
                          </div>

                          <p className="text-muted-foreground text-sm">
                            {course.description}
                          </p>

                          <div className="grid grid-cols-3 gap-4 py-4">
                            <div className="flex flex-col items-center text-center">
                              <GraduationCap className="w-5 h-5 text-emerald-600 mb-1" />
                              <span className="text-xs text-muted-foreground">{course.level}</span>
                            </div>
                            <div className="flex flex-col items-center text-center">
                              <Clock className="w-5 h-5 text-emerald-600 mb-1" />
                              <span className="text-xs text-muted-foreground">{course.duration}</span>
                            </div>
                            <div className="flex flex-col items-center text-center">
                              <Users className="w-5 h-5 text-emerald-600 mb-1" />
                              <span className="text-xs text-muted-foreground">{course.students} students</span>
                            </div>
                          </div>

                          <ul className="space-y-2">
                            {course.features.map((feature, idx) => (
                              <li key={idx} className="text-sm flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-emerald-600" />
                                {feature}
                              </li>
                            ))}
                          </ul>

                          <Link
                            href={`/arabic-center/courses/${category.id}/${idx + 1}`}
                            className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 transition-colors"
                          >
                            Enroll Now
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
