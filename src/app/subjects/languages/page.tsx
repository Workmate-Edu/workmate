'use client'

import { Globe, MessageCircle, Book, GraduationCap } from "lucide-react"
import Link from "next/link"

export default function LanguagesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-primary mb-4">Language Learning</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Master new languages with personalized instruction from native speakers and experienced language teachers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          {
            title: "Popular Languages",
            icon: Globe,
            description: "Learn the world's most spoken languages",
            languages: ["English", "Spanish", "Mandarin", "French", "Arabic", "German"]
          },
          {
            title: "Business Languages",
            icon: MessageCircle,
            description: "Enhance your professional communication",
            languages: ["Business English", "Professional Writing", "Public Speaking", "Cross-cultural Communication"]
          },
          {
            title: "Academic Languages",
            icon: Book,
            description: "Prepare for academic success",
            languages: ["Academic Writing", "Research Writing", "Technical Writing", "ESL/EFL"]
          }
        ].map((category, index) => (
          <div key={index} className="bg-card rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
            <category.icon className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
            <p className="text-muted-foreground mb-4">{category.description}</p>
            <ul className="space-y-2">
              {category.languages.map((lang, idx) => (
                <li key={idx} className="text-sm text-primary">{lang}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link 
          href="/assessment/languages"
          className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-white hover:bg-primary/90"
        >
          Start Your Language Journey
        </Link>
      </div>

      <div className="mt-16 bg-muted/50 rounded-lg p-8">
        <h2 className="text-2xl font-semibold mb-4 text-center">Why Learn with Us?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <GraduationCap className="w-8 h-8 mx-auto text-primary mb-2" />
            <h3 className="font-semibold mb-2">Native Speakers</h3>
            <p className="text-sm text-muted-foreground">Learn from qualified native speakers for authentic language exposure</p>
          </div>
          <div className="text-center">
            <MessageCircle className="w-8 h-8 mx-auto text-primary mb-2" />
            <h3 className="font-semibold mb-2">Personalized Learning</h3>
            <p className="text-sm text-muted-foreground">Customized lessons based on your goals and learning style</p>
          </div>
          <div className="text-center">
            <Globe className="w-8 h-8 mx-auto text-primary mb-2" />
            <h3 className="font-semibold mb-2">Cultural Immersion</h3>
            <p className="text-sm text-muted-foreground">Gain cultural insights alongside language skills</p>
          </div>
        </div>
      </div>
    </div>
  )
}
