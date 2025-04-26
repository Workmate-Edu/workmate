'use client'

import { ArrowLeft, Calendar, Tag } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function StoryPage({ params }: { params: { slug: string } }) {
  // This would normally come from your API/database
  const story = {
    title: "Niger Adopts Hausa as Official Language",
    date: "January 2024",
    author: "Editorial Team",
    category: "Language Policy",
    content: `
      In a historic move, Niger has officially recognized Hausa as an official language, 
      marking a significant step towards promoting African language education and cultural preservation.
      
      This decision reflects a growing trend across Africa to elevate indigenous languages
      to official status, acknowledging their crucial role in education and governance.
      
      The implementation will be phased, starting with:
      - Integration into educational curriculum
      - Official government communications
      - Public service delivery
      
      This change is expected to have far-reaching implications for:
      - Educational accessibility
      - Cultural preservation
      - Administrative efficiency
    `,
    relatedTopics: ["Education", "Culture", "Policy", "West Africa"]
  }

  return (
    <main className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link href="/stories" className="inline-block mb-8">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Stories
          </Button>
        </Link>

        <article className="prose prose-slate dark:prose-invert max-w-none">
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {story.date}
            </div>
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              {story.category}
            </div>
          </div>

          <h1 className="mb-8">{story.title}</h1>
          
          <div className="whitespace-pre-line">
            {story.content}
          </div>

          <div className="mt-8 pt-8 border-t">
            <h3 className="text-lg font-semibold mb-4">Related Topics</h3>
            <div className="flex flex-wrap gap-2">
              {story.relatedTopics.map((topic) => (
                <span 
                  key={topic}
                  className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        </article>
      </div>
    </main>
  )
}
