import Link from "next/link"
import { 
  BookOpen, 
  Users, 
  Calendar, Star, 
  Award, Sparkles, 
  GraduationCap, Target, Clock, Shield,
  Atom,
  Globe,
  Briefcase
} from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-slate-50 dark:from-gray-900 dark:to-gray-800 px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,transparent)] dark:bg-grid-slate-700/25"></div>
        
        {/* Academic-style decorative elements */}
        <div className="absolute top-0 left-0 w-32 h-32 md:w-48 md:h-48 opacity-10">
          <GraduationCap className="w-full h-full text-primary" />
        </div>
        <div className="absolute bottom-0 right-0 w-32 h-32 md:w-48 md:h-48 opacity-10">
          <BookOpen className="w-full h-full text-secondary" />
        </div>
        
        <div className="relative">
          <div className="container mx-auto flex max-w-[64rem] flex-col items-center gap-4 text-center">
            {/* Academic Excellence Badge */}
            <div className="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary flex items-center gap-2">
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">Where Every Mind Has Its Own Path to Excellence</span>
              <span className="sm:hidden">Personalized Excellence</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">
              <span className="block text-primary">Your Unique Learning Journey</span>
              <span className="block text-sm sm:text-base md:text-lg lg:text-xl mt-2 text-muted-foreground font-normal">
                Because no two minds learn alike
              </span>
            </h1>
            
            {/* Statistics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 w-full max-w-4xl">
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-3xl font-bold text-primary">85%</div>
                <div className="text-sm text-muted-foreground">Higher engagement with personalized learning</div>
              </div>
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-3xl font-bold text-primary">3x</div>
                <div className="text-sm text-muted-foreground">Faster progress with tailored instruction</div>
              </div>
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-3xl font-bold text-primary">100%</div>
                <div className="text-sm text-muted-foreground">Personalized assessment & feedback</div>
              </div>
            </div>
            
            {/* Description */}
            <p className="max-w-[42rem] leading-normal text-muted-foreground text-sm sm:text-base lg:text-lg mt-6">
              Begin with a comprehensive assessment that understands your unique learning style, strengths, and goals. 
              Then connect with expert teachers who craft a personalized learning journey just for you.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:space-x-4 w-full sm:w-auto mt-8">
              <Link
                href="/assessment"
                className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 w-full sm:w-auto gap-2"
              >
                <Target className="h-4 w-4" />
                Start Your Assessment
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex h-12 items-center justify-center rounded-md border border-primary bg-background px-8 text-sm font-medium text-primary ring-offset-background transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 w-full sm:w-auto gap-2"
              >
                <Users className="h-4 w-4" />
                Get Started
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
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Explore Our Subject Areas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* STEM */}
            <Link 
              href="/subjects/stem" 
              className="group no-underline"
              prefetch={false}
            >
              <div className="bg-card rounded-lg p-6 shadow-lg hover:shadow-xl transition-all group-hover:-translate-y-1">
                <Atom className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">STEM Education</h3>
                <p className="text-muted-foreground">
                  Master Science, Technology, Engineering, and Mathematics with expert guidance.
                </p>
              </div>
            </Link>

            {/* Languages */}
            <Link 
              href="/subjects/languages" 
              className="group no-underline"
              prefetch={false}
            >
              <div className="bg-card rounded-lg p-6 shadow-lg hover:shadow-xl transition-all group-hover:-translate-y-1">
                <Globe className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Language Learning</h3>
                <p className="text-muted-foreground">
                  Learn new languages with native speakers and experienced teachers.
                </p>
              </div>
            </Link>

            {/* Business */}
            <Link 
              href="/subjects/business" 
              className="group no-underline"
              prefetch={false}
            >
              <div className="bg-card rounded-lg p-6 shadow-lg hover:shadow-xl transition-all group-hover:-translate-y-1">
                <Briefcase className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Business & Entrepreneurship</h3>
                <p className="text-muted-foreground">
                  Develop business acumen and entrepreneurial skills with industry experts.
                </p>
              </div>
            </Link>
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
