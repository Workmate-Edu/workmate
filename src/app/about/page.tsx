'use client'

import { 
  Brain, 
  Users2 as Users, 
  Lightbulb,
  Target, 
  BarChart3 as ChartBar,
  Heart 
} from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Every Learner Has a Unique Story
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              We're inspired by the beautiful diversity of how people learn, grow, and achieve their dreams.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent"></div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto prose prose-lg">
            <h2 className="text-3xl font-bold text-center mb-8">Our Story</h2>
            <p className="text-muted-foreground">
              It all started with a simple observation: every person learns differently. We saw children lighting up when 
              they discovered concepts through play, adults finding breakthrough moments in hands-on projects, and 
              learners of all ages thriving when education adapted to their unique needs.
            </p>
            <p className="text-muted-foreground">
              This inspiration led us to create a learning platform that celebrates these differences. We believe that 
              education should never be one-size-fits-all, but rather a journey as unique as each individual who 
              embarks on it.
            </p>
          </div>
        </div>
      </section>

      {/* What Sets Us Apart */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What Sets Us Apart</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Adaptive Learning Paths</h3>
              <p className="text-muted-foreground">
                Our platform adapts in real-time to each learner's pace, preferences, and progress, ensuring every 
                study session is perfectly tailored.
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Lightbulb className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Multi-Modal Learning</h3>
              <p className="text-muted-foreground">
                Visual, auditory, or hands-on - we provide diverse learning methods because we understand that 
                brilliance comes in many forms.
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <ChartBar className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Data-Driven Growth</h3>
              <p className="text-muted-foreground">
                We use advanced analytics to track progress, identify opportunities, and celebrate every milestone 
                along your learning journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Impact in Numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">87%</div>
              <div className="text-sm text-muted-foreground">
                of learners achieve their goals faster with personalized paths
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">92%</div>
              <div className="text-sm text-muted-foreground">
                report better understanding through adaptive learning
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">3.5x</div>
              <div className="text-sm text-muted-foreground">
                increase in engagement with personalized content
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">95%</div>
              <div className="text-sm text-muted-foreground">
                satisfaction rate with learning outcomes
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision for the Future */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 mx-auto">
              <Target className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-6">Our Vision for the Future</h2>
            <p className="text-lg text-muted-foreground mb-8">
              We envision a world where every person's unique learning style is celebrated and supported. Where 
              education adapts to the learner, not the other way around. Where success is measured not just by 
              test scores, but by personal growth, understanding, and achievement of individual goals.
            </p>
            <p className="text-lg text-muted-foreground">
              Together, we're building this future - one personalized learning journey at a time.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
