'use client'

import Link from 'next/link'
import { Atom, Globe, Briefcase, ArrowRight, BookOpen, Users, Trophy } from 'lucide-react'

export default function SubjectsPage() {
  const subjects = [
    {
      title: 'STEM Education',
      description: 'Explore Science, Technology, Engineering, and Mathematics through interactive learning.',
      icon: Atom,
      href: '/subjects/stem',
      color: 'bg-blue-500/10',
      textColor: 'text-blue-500',
      features: ['Interactive Labs', 'Real-world Projects', 'Expert Mentorship']
    },
    {
      title: 'Language Learning',
      description: 'Master new languages with our comprehensive language learning programs.',
      icon: Globe,
      href: '/subjects/languages',
      color: 'bg-green-500/10',
      textColor: 'text-green-500',
      features: ['Native Speakers', 'Cultural Immersion', 'Practical Conversations']
    },
    {
      title: 'Business & Entrepreneurship',
      description: 'Develop business acumen and entrepreneurial skills for the modern economy.',
      icon: Briefcase,
      href: '/subjects/business',
      color: 'bg-purple-500/10',
      textColor: 'text-purple-500',
      features: ['Case Studies', 'Business Planning', 'Market Analysis']
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Explore Our Learning Paths
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Choose from our diverse range of subjects and start your learning journey today
            </p>
          </div>
        </div>
      </section>

      {/* Subject Cards */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {subjects.map((subject, index) => (
              <div key={index} className="bg-card rounded-lg overflow-hidden shadow-lg">
                <div className="p-8">
                  <div className={`w-16 h-16 ${subject.color} rounded-lg flex items-center justify-center mb-6`}>
                    <subject.icon className={`w-8 h-8 ${subject.textColor}`} />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4">{subject.title}</h3>
                  <p className="text-muted-foreground mb-6">
                    {subject.description}
                  </p>
                  <div className="space-y-3 mb-8">
                    {subject.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Link 
                    href={subject.href}
                    className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary/90 w-full"
                  >
                    Explore {subject.title.split(' ')[0]}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Programs?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Expert-Led Content</h3>
              <p className="text-muted-foreground">
                Learn from industry experts and experienced educators
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Community Learning</h3>
              <p className="text-muted-foreground">
                Connect with peers and collaborate on projects
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Recognized Certification</h3>
              <p className="text-muted-foreground">
                Earn certificates upon completion of courses
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Learning?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Take our assessment to get personalized recommendations and create your learning path
          </p>
          <Link 
            href="/assessment"
            className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-white hover:bg-primary/90"
          >
            Take Assessment
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
