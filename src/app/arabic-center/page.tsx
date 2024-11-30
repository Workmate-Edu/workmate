"use client"

import Link from "next/link"
import { 
  BookOpen, 
  Users, 
  Calendar,
  Award,
  GraduationCap,
  ScrollText,
  BookMarked,
  Languages
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useThemeContext } from "@/hooks/use-theme-context"

export default function ArabicCenterPage() {
  const { theme } = useThemeContext()

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className={cn(
        "relative overflow-hidden",
        "bg-gradient-to-b from-white to-slate-50",
        "dark:from-gray-900 dark:to-gray-950"
      )}>
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,transparent)] dark:opacity-20"></div>
        <div className="relative section-padding">
          <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
            <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/50 px-4 py-1.5 text-sm font-medium text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
              <BookMarked className="h-4 w-4" />
              Learn Arabic the Traditional Way
            </div>
            <div className="space-y-2">
              <h1 className={cn(
                "font-heading text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl",
                "text-slate-900 dark:text-slate-50"
              )}>
                Master Arabic Through<br />Authentic Learning
              </h1>
              <p className="text-2xl text-emerald-800 dark:text-emerald-200 font-arabic text-center mt-4">
                تَعَلَّمُوا العَرَبِيَّةَ فَإِنَّهَا مِنْ دِينِكُم
              </p>
              <p className="text-sm text-emerald-600 dark:text-emerald-400 italic">
                "Learn Arabic for it is part of your religion"
              </p>
            </div>
            <div className="relative">
              <div className="absolute -left-8 -top-8">
                <div className="text-4xl font-arabic text-emerald-800/10 dark:text-emerald-200/10">
                  العلم
                </div>
              </div>
              <div className="absolute -right-8 -bottom-8">
                <div className="text-4xl font-arabic text-emerald-800/10 dark:text-emerald-200/10">
                  الحكمة
                </div>
              </div>
              <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8 relative dark:text-gray-400">
                Experience traditional Arabic learning following the methodology of the Salaf. Understand the Quran and classical texts directly from their sources.
              </p>
            </div>
            <div className="mt-4 space-y-4 sm:space-x-4 sm:space-y-0">
              <Link
                href="/arabic-center/courses"
                className="inline-flex h-11 items-center justify-center rounded-md bg-emerald-700 dark:bg-emerald-600 px-8 text-sm font-medium text-white ring-offset-background transition-colors hover:bg-emerald-800 dark:hover:bg-emerald-700"
              >
                <span className="mr-2">View Our Courses</span>
                <span className="font-arabic">الدورات</span>
              </Link>
              <Link
                href="/arabic-center/assessment"
                className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground dark:border-gray-700 dark:hover:bg-gray-800"
              >
                <span className="mr-2">Free Assessment</span>
                <span className="font-arabic">التقييم</span>
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-4 gap-4 text-center text-sm text-muted-foreground dark:text-gray-400">
              <div className="flex flex-col items-center space-y-2">
                <div className="font-arabic text-lg text-emerald-700 dark:text-emerald-400">القرآن</div>
                <div>Quran</div>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="font-arabic text-lg text-emerald-700 dark:text-emerald-400">النحو</div>
                <div>Grammar</div>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="font-arabic text-lg text-emerald-700 dark:text-emerald-400">الصرف</div>
                <div>Morphology</div>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="font-arabic text-lg text-emerald-700 dark:text-emerald-400">الإملاء</div>
                <div>Writing</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum Section */}
      <section className={cn(
        "section-padding",
        theme.background.light
      )}>
        <div className="container">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className={cn(
              "font-heading text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl",
              "text-slate-900 dark:text-slate-50"
            )}>
              Comprehensive Arabic Curriculum
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground dark:text-gray-400 sm:text-lg sm:leading-7">
              Traditional step-by-step approach to mastering Arabic
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-8 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3 mt-16">
            <div className={cn(
              "relative overflow-hidden rounded-lg border p-2",
              theme.background.light,
              theme.border
            )}>
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <div className="space-y-2">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                    <Languages className="h-6 w-6 text-emerald-700 dark:text-emerald-400" />
                  </div>
                  <h3 className={cn("font-bold", "text-slate-900 dark:text-slate-50")}>Quranic Arabic</h3>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">
                    Master the language of the Quran with proper pronunciation and understanding
                  </p>
                </div>
              </div>
            </div>
            <div className={cn(
              "relative overflow-hidden rounded-lg border p-2",
              theme.background.light,
              theme.border
            )}>
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <div className="space-y-2">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                    <ScrollText className="h-6 w-6 text-emerald-700 dark:text-emerald-400" />
                  </div>
                  <h3 className={cn("font-bold", "text-slate-900 dark:text-slate-50")}>Arabic Grammar (النحو)</h3>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">
                    Learn essential grammar rules following classical texts and methods
                  </p>
                </div>
              </div>
            </div>
            <div className={cn(
              "relative overflow-hidden rounded-lg border p-2",
              theme.background.light,
              theme.border
            )}>
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <div className="space-y-2">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-emerald-700 dark:text-emerald-400" />
                  </div>
                  <h3 className={cn("font-bold", "text-slate-900 dark:text-slate-50")}>Classical Texts</h3>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">
                    Study authentic texts from renowned scholars of the Salaf
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={cn(
        "section-padding",
        "bg-slate-50 dark:bg-gray-900"
      )}>
        <div className="container">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className={cn(
              "font-heading text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl",
              "text-slate-900 dark:text-slate-50"
            )}>
              Our Teaching Methodology
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground dark:text-gray-400 sm:text-lg sm:leading-7">
              Following the path of the righteous predecessors
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-8 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3 mt-16">
            <div className={cn(
              "relative overflow-hidden rounded-lg border p-2",
              theme.background.light,
              theme.border
            )}>
              <div className="flex h-[200px] flex-col justify-between rounded-md p-6">
                <div className="space-y-2">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                    <GraduationCap className="h-6 w-6 text-emerald-700 dark:text-emerald-400" />
                  </div>
                  <h3 className={cn("font-bold", "text-slate-900 dark:text-slate-50")}>Qualified Teachers</h3>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">
                    Learn from scholars with proper chains of transmission (إجازة)
                  </p>
                </div>
              </div>
            </div>
            <div className={cn(
              "relative overflow-hidden rounded-lg border p-2",
              theme.background.light,
              theme.border
            )}>
              <div className="flex h-[200px] flex-col justify-between rounded-md p-6">
                <div className="space-y-2">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                    <Award className="h-6 w-6 text-emerald-700 dark:text-emerald-400" />
                  </div>
                  <h3 className={cn("font-bold", "text-slate-900 dark:text-slate-50")}>Traditional Method</h3>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">
                    Step-by-step learning following time-tested teaching methods
                  </p>
                </div>
              </div>
            </div>
            <div className={cn(
              "relative overflow-hidden rounded-lg border p-2",
              theme.background.light,
              theme.border
            )}>
              <div className="flex h-[200px] flex-col justify-between rounded-md p-6">
                <div className="space-y-2">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-emerald-700 dark:text-emerald-400" />
                  </div>
                  <h3 className={cn("font-bold", "text-slate-900 dark:text-slate-50")}>Structured Learning</h3>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">
                    Regular classes with proper progression through the curriculum
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hadith Section */}
      <section className={cn(
        "section-padding",
        "bg-emerald-50 dark:bg-gray-900"
      )}>
        <div className="container">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className={cn(
              "font-heading text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl",
              "text-slate-900 dark:text-slate-50"
            )}>
              Virtues of Seeking Knowledge
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground dark:text-gray-400 sm:text-lg sm:leading-7">
              From Authentic Sources
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-8 sm:grid-cols-2 md:max-w-[64rem] mt-16">
            <div className="relative overflow-hidden rounded-lg border bg-white dark:bg-gray-800 p-8">
              <div className="space-y-4">
                <p className="text-xl text-right leading-relaxed text-emerald-950 dark:text-emerald-400 font-arabic">
                  مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ طَرِيقًا إِلَى الْجَنَّةِ
                </p>
                <p className="text-sm text-muted-foreground dark:text-gray-400">
                  "Whoever takes a path in search of knowledge, Allah makes easy for him a path to Paradise."
                </p>
                <p className="text-xs text-muted-foreground dark:text-gray-400">- Sahih Muslim</p>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-white dark:bg-gray-800 p-8">
              <div className="space-y-4">
                <p className="text-xl text-right leading-relaxed text-emerald-950 dark:text-emerald-400 font-arabic">
                  طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ
                </p>
                <p className="text-sm text-muted-foreground dark:text-gray-400">
                  "Seeking knowledge is an obligation upon every Muslim."
                </p>
                <p className="text-xs text-muted-foreground dark:text-gray-400">- Sunan Ibn Majah</p>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-white dark:bg-gray-800 p-8">
              <div className="space-y-4">
                <p className="text-xl text-right leading-relaxed text-emerald-950 dark:text-emerald-400 font-arabic">
                  إِنَّ الْعُلَمَاءَ وَرَثَةُ الْأَنْبِيَاءِ
                </p>
                <p className="text-sm text-muted-foreground dark:text-gray-400">
                  "Indeed, the scholars are the inheritors of the prophets."
                </p>
                <p className="text-xs text-muted-foreground dark:text-gray-400">- Abu Dawud</p>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-white dark:bg-gray-800 p-8">
              <div className="space-y-4">
                <p className="text-xl text-right leading-relaxed text-emerald-950 dark:text-emerald-400 font-arabic">
                  خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ
                </p>
                <p className="text-sm text-muted-foreground dark:text-gray-400">
                  "The best among you are those who learn the Quran and teach it."
                </p>
                <p className="text-xs text-muted-foreground dark:text-gray-400">- Sahih al-Bukhari</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={cn(
        "section-padding",
        theme.background.light
      )}>
        <div className="container">
          <div className="mx-auto grid max-w-[64rem] gap-8 sm:grid-cols-2 md:grid-cols-4">
            <div className="flex flex-col items-center justify-center space-y-2 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
                <Users className="h-8 w-8 text-emerald-700 dark:text-emerald-400" />
              </div>
              <h3 className={cn("font-heading text-3xl font-bold", "text-slate-900 dark:text-slate-50")}>500+</h3>
              <p className="text-sm text-muted-foreground dark:text-gray-400">Active Students</p>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
                <GraduationCap className="h-8 w-8 text-emerald-700 dark:text-emerald-400" />
              </div>
              <h3 className={cn("font-heading text-3xl font-bold", "text-slate-900 dark:text-slate-50")}>20+</h3>
              <p className="text-sm text-muted-foreground dark:text-gray-400">Qualified Teachers</p>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
                <BookOpen className="h-8 w-8 text-emerald-700 dark:text-emerald-400" />
              </div>
              <h3 className={cn("font-heading text-3xl font-bold", "text-slate-900 dark:text-slate-50")}>10+</h3>
              <p className="text-sm text-muted-foreground dark:text-gray-400">Classical Texts</p>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
                <Award className="h-8 w-8 text-emerald-700 dark:text-emerald-400" />
              </div>
              <h3 className={cn("font-heading text-3xl font-bold", "text-slate-900 dark:text-slate-50")}>5+</h3>
              <p className="text-sm text-muted-foreground dark:text-gray-400">Years Teaching</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
