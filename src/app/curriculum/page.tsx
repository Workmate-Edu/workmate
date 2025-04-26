'use client'

import { Button } from "@/components/ui/button"
import { 
  CheckCircle, 
  Globe2, 
  GraduationCap, 
  Beaker, 
  BrainCog, 
  ArrowRight 
} from "lucide-react"
import Link from "next/link"

const curriculumTracks = [
  {
    title: "Language Track",
    icon: Globe2,
    ages: "6-16",
    features: [
      "Interactive speaking practice with AI",
      "Cultural stories and songs",
      "Weekly live sessions with native speakers",
      "Progress tracking and rewards"
    ]
  },
  {
    title: "STEM Track",
    icon: Beaker,
    ages: "8-16",
    features: [
      "Hands-on science experiments",
      "Math problem-solving games",
      "Coding basics with Scratch",
      "African innovation projects"
    ]
  }
]

export default function CurriculumPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">
            Our Learning Curriculum
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A unique blend of African language learning and STEM education, 
            designed specifically for young minds
          </p>
        </div>

        {/* Curriculum Tracks */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {curriculumTracks.map((track) => (
            <div key={track.title} className="bg-card rounded-lg border p-6">
              <div className="flex items-center gap-3 mb-6">
                <track.icon className="h-8 w-8 text-primary" />
                <div>
                  <h2 className="text-2xl font-semibold">{track.title}</h2>
                  <p className="text-sm text-muted-foreground">Ages {track.ages}</p>
                </div>
              </div>
              <ul className="space-y-3">
                {track.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary/60" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Sample Weekly Schedule */}
        <div className="bg-secondary/5 rounded-lg p-8 mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            Sample Weekly Schedule
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {['Monday', 'Wednesday', 'Friday', 'Weekend'].map((day) => (
              <div key={day} className="bg-card rounded-lg p-4 border">
                <h3 className="font-medium mb-2">{day}</h3>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• 30min Language Session</li>
                  <li>• 30min STEM Activity</li>
                  {day === 'Weekend' && <li>• Live Group Session</li>}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Link href="/sign-up">
            <Button size="lg" className="group">
              Start Learning Now 
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <p className="mt-4 text-sm text-muted-foreground">
            14-day free trial • No credit card required
          </p>
        </div>
      </div>
    </main>
  )
}
