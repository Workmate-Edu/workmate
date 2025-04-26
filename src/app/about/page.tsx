'use client'

import { 
  Globe2, 
  HeartHandshake,
  Lightbulb,
  Rocket, 
  Stars,
  Target,
  Users2 
} from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Animation */}
      <section className="relative py-20 bg-gradient-to-b from-amber-50 to-background overflow-hidden">
        <div className="absolute inset-0 bg-[url('/african-pattern.svg')] opacity-5"></div>
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-block animate-bounce mb-6">
              <Globe2 className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              Discover Africa Through Learning
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Join a global community exploring African languages, science, and innovation
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Mission */}
            <div className="bg-card p-8 rounded-lg shadow-sm hover:shadow-lg transition-all text-center">
              <div className="inline-flex items-center justify-center">
                <Stars className="h-8 w-8 text-primary animate-pulse" />
                <h2 className="text-3xl font-bold ml-3">Our Mission</h2>
              </div>
              <p className="text-muted-foreground mt-6">
                To create an inclusive space where everyone can explore African languages 
                and STEM education, fostering a global community of learners connected 
                through knowledge and cultural appreciation.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-card p-8 rounded-lg shadow-sm hover:shadow-lg transition-all text-center">
              <div className="inline-flex items-center justify-center">
                <Target className="h-8 w-8 text-primary animate-pulse" />
                <h2 className="text-3xl font-bold ml-3">Our Vision</h2>
              </div>
              <p className="text-muted-foreground mt-6">
                To be the bridge connecting people worldwide with African knowledge, 
                fostering innovation while preserving cultural heritage, and empowering 
                the next generation of global citizens through education.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer - Interactive Cards */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Learning Ecosystem</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="group bg-card p-6 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Globe2 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Language & Heritage</h3>
              </div>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Stars className="w-4 h-4 text-primary" />
                  Explore African Languages
                </li>
                <li className="flex items-center gap-2">
                  <Stars className="w-4 h-4 text-primary" />
                  Experience Rich Cultural Context
                </li>
                <li className="flex items-center gap-2">
                  <Stars className="w-4 h-4 text-primary" />
                  Learn at Your Own Pace
                </li>
              </ul>
            </div>

            <div className="group bg-card p-6 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Rocket className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Science & Innovation</h3>
              </div>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Stars className="w-4 h-4 text-primary" />
                  Comprehensive STEM Education
                </li>
                <li className="flex items-center gap-2">
                  <Stars className="w-4 h-4 text-primary" />
                  Global Scientific Contribution
                </li>
                <li className="flex items-center gap-2">
                  <Stars className="w-4 h-4 text-primary" />
                  Modern Learning Tools
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Community Stats with Animation */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "10K+", label: "Global Learners" },
              { number: "5+", label: "African Languages" },
              { number: "100+", label: "STEM Courses" },
              { number: "95%", label: "Satisfaction Rate" }
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-3xl font-bold mb-2 text-primary group-hover:scale-110 transition-transform">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Us CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Begin Your Journey Today</h2>
            <p className="text-lg opacity-90 mb-8">
              Whether you're reconnecting with your heritage or advancing in STEM, 
              your unique story becomes part of our global community.
            </p>
            <button className="bg-background text-primary px-8 py-3 rounded-full font-medium hover:bg-background/90 transition-colors">
              Join Our Community
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
