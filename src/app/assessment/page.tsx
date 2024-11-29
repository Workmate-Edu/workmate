'use client'

import Link from 'next/link'
import { Atom, Globe, Briefcase, ArrowRight } from 'lucide-react'

export default function AssessmentPage() {
  const assessments = [
    {
      title: 'STEM Assessment',
      description: 'Evaluate your skills in Science, Technology, Engineering, and Mathematics.',
      icon: Atom,
      href: '/assessment/stem',
      color: 'bg-blue-500/10',
      textColor: 'text-blue-500'
    },
    {
      title: 'Language Assessment',
      description: 'Discover your language proficiency and learning path.',
      icon: Globe,
      href: '/assessment/languages',
      color: 'bg-green-500/10',
      textColor: 'text-green-500'
    },
    {
      title: 'Business Assessment',
      description: 'Evaluate your business acumen and entrepreneurial skills.',
      icon: Briefcase,
      href: '/assessment/business',
      color: 'bg-purple-500/10',
      textColor: 'text-purple-500'
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Personalized Learning Assessments
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Take our specialized assessments to create your customized learning journey
            </p>
          </div>
        </div>
      </section>

      {/* Assessment Cards */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {assessments.map((assessment, index) => (
              <Link 
                key={index}
                href={assessment.href}
                className="group relative bg-card hover:shadow-lg transition-all duration-300 rounded-lg overflow-hidden"
              >
                <div className="p-8">
                  <div className={`w-16 h-16 ${assessment.color} rounded-lg flex items-center justify-center mb-6`}>
                    <assessment.icon className={`w-8 h-8 ${assessment.textColor}`} />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4">{assessment.title}</h3>
                  <p className="text-muted-foreground mb-6">
                    {assessment.description}
                  </p>
                  <div className="flex items-center text-primary">
                    <span className="mr-2">Start Assessment</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary rounded-lg transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Why Take Our Assessments?</h2>
            <div className="grid md:grid-cols-2 gap-8 mt-12">
              <div className="bg-card p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Personalized Learning Path</h3>
                <p className="text-muted-foreground">
                  Get a customized curriculum based on your skills and goals
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Progress Tracking</h3>
                <p className="text-muted-foreground">
                  Monitor your improvement with detailed progress analytics
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Expert Recommendations</h3>
                <p className="text-muted-foreground">
                  Receive tailored suggestions from field experts
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Flexible Learning</h3>
                <p className="text-muted-foreground">
                  Learn at your own pace with adaptive content
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
