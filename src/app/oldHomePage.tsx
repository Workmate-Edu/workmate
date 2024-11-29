import Link from "next/link"
import { 
  BookOpen, 
  Users, 
  Calendar, Star, 
  Award, Sparkles, 
  GraduationCap, Target, Clock, Shield 
} from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-slate-50 dark:from-gray-900 dark:to-gray-800 px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,transparent)] dark:bg-grid-slate-700/25"></div>
        <div className="relative">
          <div className="container mx-auto flex max-w-[64rem] flex-col items-center gap-4 text-center">
            <div className="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Transforming Education Through Connection</span>
              <span className="sm:hidden">Transform Education</span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              <span className="block sm:inline">Learn from</span>{" "}
              <span className="block sm:inline">Expert Teachers,</span>{" "}
              <span className="block">Your Way</span>
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground text-sm sm:text-base lg:text-xl px-4 sm:px-0">
              Experience personalized learning that adapts to your style. Connect with verified teachers who understand and nurture your unique learning journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:space-x-4 w-full sm:w-auto px-4 sm:px-0">
              <Link
                href="/teachers"
                className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 w-full sm:w-auto"
              >
                Find Your Teacher
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 w-full sm:w-auto"
              >
                Start Learning
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.1]">
              Your Learning Journey Made Simple
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground text-sm sm:text-base lg:text-lg">
              Three easy steps to start your personalized learning experience
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-4 sm:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 md:max-w-[64rem] mt-8 sm:mt-12 lg:mt-16">
            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <div className="space-y-2">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold">1. Discover Your Style</h3>
                  <p className="text-sm text-muted-foreground">
                    Take our learning style assessment to understand how you learn best
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <div className="space-y-2">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold">2. Meet Your Match</h3>
                  <p className="text-sm text-muted-foreground">
                    Get matched with teachers who complement your learning style
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <div className="space-y-2">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold">3. Start Learning</h3>
                  <p className="text-sm text-muted-foreground">
                    Begin your personalized learning journey with expert guidance
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 bg-slate-50 dark:bg-gray-800">
        <div className="container mx-auto">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.1]">
              Why Choose WorkMate?
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground text-sm sm:text-base lg:text-lg">
              Experience the perfect blend of technology and human connection
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-4 sm:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 md:max-w-[64rem] mt-8 sm:mt-12 lg:mt-16">
            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[200px] flex-col justify-between rounded-md p-6">
                <div className="space-y-2">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold">Expert Teachers</h3>
                  <p className="text-sm text-muted-foreground">
                    Learn from verified professionals with proven teaching experience
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[200px] flex-col justify-between rounded-md p-6">
                <div className="space-y-2">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold">Personalized Matching</h3>
                  <p className="text-sm text-muted-foreground">
                    Our AI-powered system finds the perfect teacher-student match
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[200px] flex-col justify-between rounded-md p-6">
                <div className="space-y-2">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold">Flexible Schedule</h3>
                  <p className="text-sm text-muted-foreground">
                    Learn at your own pace with flexible scheduling options
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white to-slate-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto">
          <div className="mx-auto grid max-w-[64rem] gap-4 sm:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center justify-center space-y-2 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">10,000+</h3>
              <p className="text-sm text-muted-foreground">Active Students</p>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">500+</h3>
              <p className="text-sm text-muted-foreground">Expert Teachers</p>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">50+</h3>
              <p className="text-sm text-muted-foreground">Subjects Offered</p>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">4.9/5</h3>
              <p className="text-sm text-muted-foreground">Student Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* Subject Areas Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.1]">
              Discover Your Subject
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground text-sm sm:text-base lg:text-lg">
              Explore our wide range of subjects taught by expert teachers
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-4 sm:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 md:max-w-[64rem] mt-8 sm:mt-12 lg:mt-16">
            {/* STEM */}
            <div className="group relative overflow-hidden rounded-lg border bg-background p-2 transition-all hover:shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-0 transition-opacity group-hover:opacity-100"></div>
              <div className="relative flex h-[200px] flex-col justify-between rounded-md p-6">
                <div className="space-y-2">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                      <path d="M8 7h8" />
                      <path d="M8 11h8" />
                      <path d="M8 15h8" />
                    </svg>
                  </div>
                  <h3 className="font-bold">STEM Education</h3>
                  <p className="text-sm text-muted-foreground">
                    Mathematics, Physics, Chemistry, Biology, Computer Science
                  </p>
                </div>
                <Link href="/subjects/stem" className="text-sm text-primary hover:underline">
                  Explore STEM Subjects →
                </Link>
              </div>
            </div>
            {/* Languages */}
            <div className="group relative overflow-hidden rounded-lg border bg-background p-2 transition-all hover:shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-0 transition-opacity group-hover:opacity-100"></div>
              <div className="relative flex h-[200px] flex-col justify-between rounded-md p-6">
                <div className="space-y-2">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                  </div>
                  <h3 className="font-bold">Languages</h3>
                  <p className="text-sm text-muted-foreground">
                    Arabic, English, French, Spanish, Mandarin
                  </p>
                </div>
                <Link href="/subjects/languages" className="text-sm text-primary hover:underline">
                  Explore Languages →
                </Link>
              </div>
            </div>
            {/* Arts */}
            <div className="group relative overflow-hidden rounded-lg border bg-background p-2 transition-all hover:shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-0 transition-opacity group-hover:opacity-100"></div>
              <div className="relative flex h-[200px] flex-col justify-between rounded-md p-6">
                <div className="space-y-2">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M12 8c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 9c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                  <h3 className="font-bold">Arts & Music</h3>
                  <p className="text-sm text-muted-foreground">
                    Visual Arts, Music, Drama, Dance, Creative Writing
                  </p>
                </div>
                <Link href="/subjects/arts" className="text-sm text-primary hover:underline">
                  Explore Arts →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 bg-slate-50 dark:bg-gray-800">
        <div className="container mx-auto">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.1]">
              Success Stories
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground text-sm sm:text-base lg:text-lg">
              Join our community of successful learners
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-4 sm:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 md:max-w-[64rem] mt-8 sm:mt-12 lg:mt-16">
            <div className="relative overflow-hidden rounded-lg border bg-background p-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold">Sarah M.</h4>
                    <p className="text-sm text-muted-foreground">Mathematics Student</p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  "The personalized matching system helped me find a teacher who truly understands how I learn. My grades have improved significantly!"
                </p>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold">Ahmed K.</h4>
                    <p className="text-sm text-muted-foreground">Arabic Language Learner</p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  "Learning Arabic was a challenge until I found my teacher through WorkMate. The cultural insights and personalized approach made all the difference."
                </p>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold">Dr. James W.</h4>
                    <p className="text-sm text-muted-foreground">Physics Teacher</p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  "As a teacher, I appreciate how WorkMate matches me with students who share my teaching style. It makes lessons more effective and enjoyable."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.1]">
              Trusted by Leading Institutions
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground text-sm sm:text-base lg:text-lg">
              Our platform is recognized and trusted by educational institutions worldwide
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-4 sm:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 md:max-w-[64rem] mt-8 sm:mt-12 lg:mt-16">
            <div className="flex items-center justify-center p-8">
              <Shield className="h-16 w-16 text-muted-foreground/30" />
            </div>
            <div className="flex items-center justify-center p-8">
              <Award className="h-16 w-16 text-muted-foreground/30" />
            </div>
            <div className="flex items-center justify-center p-8">
              <Star className="h-16 w-16 text-muted-foreground/30" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.1]">
              Ready to Transform Your Learning Journey?
            </h2>
            <p className="max-w-[85%] leading-normal text-sm sm:text-base lg:text-lg">
              Join thousands of students who have found their perfect learning match
            </p>
            <div className="mt-8">
              <Link
                href="/sign-up"
                className="inline-flex h-11 items-center justify-center rounded-md bg-primary-foreground px-8 text-sm font-medium text-primary ring-offset-background transition-colors hover:bg-primary-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              >
                Get Started Today
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
