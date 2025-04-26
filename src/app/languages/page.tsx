'use client'

import { Gem, Globe, ScrollText, Users } from 'lucide-react'
import type { Language } from '@/types'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { StoryCard } from '@/components/stories/story-card'

const languages: Language[] = [
  {
    name: 'Yoruba',
    description: 'Explore the rich language of Yorubaland',
    level: ['Beginner', 'Intermediate', 'Advanced'],
    cultural: 'West African Heritage',
    icon: '🇳🇬'
  },
  {
    name: 'Swahili',
    description: "Learn East Africa's most spoken language'",
    level: ['Beginner', 'Intermediate', 'Advanced'],
    cultural: 'East African Culture',
    icon: '🇹🇿'
  },
  {
    name: 'Hausa',
    description: 'Master the lingua franca of Northern Nigeria',
    level: ['Beginner', 'Intermediate'],
    cultural: 'Hausa Culture & Traditions',
    icon: '🇳🇬'
  },
  {
    name: 'Igbo',
    description: 'Discover the language of the Igbo people',
    level: ['Beginner', 'Intermediate'],
    cultural: 'Igbo Heritage',
    icon: '🇳🇬'
  },
  {
    name: 'Arabic',
    description: 'Learn Classical and Modern Arabic',
    level: ['Beginner', 'Intermediate', 'Advanced'],
    cultural: 'Arabic Literature & Culture',
    icon: '🌟'
  }
]

export default function LanguagesPage() {
  const router = useRouter()
  const { data: session } = useSession()

  const handleStartLearning = () => {
    if (!session) {
      router.push('/sign-in')
      return
    }
    router.push('/dashboard')
  }

  const languageStories = [
    {
      slug: 'niger-adopts-hausa',
      title: 'Niger Adopts Hausa as Official Language',
      excerpt: 'Niger has officially recognized Hausa as an official language, marking a significant step in African language policy.',
      date: 'January 2024',
      category: 'Language Policy'
    },
    {
      slug: 'swahili-tech-innovation',
      title: 'Swahili Goes Digital',
      excerpt: 'New AI-powered tools making Swahili learning more accessible across East Africa.',
      date: 'February 2024',
      category: 'Technology'
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">African Languages</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you're reconnecting with heritage, planning travel, or exploring African 
            culture - discover the beauty of African languages through interactive learning
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <span className="px-4 py-2 bg-primary/10 rounded-full text-sm">
              Cultural Connection
            </span>
            <span className="px-4 py-2 bg-primary/10 rounded-full text-sm">
              Travel Preparation
            </span>
            <span className="px-4 py-2 bg-primary/10 rounded-full text-sm">
              Business Communication
            </span>
            <span className="px-4 py-2 bg-primary/10 rounded-full text-sm">
              Personal Interest
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {languages.map((lang) => (
            <div key={lang.name} className="group relative overflow-hidden rounded-lg border bg-card hover:border-primary transition-colors">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl">{lang.icon}</span>
                  <div>
                    <h3 className="text-xl font-semibold">{lang.name}</h3>
                    <p className="text-sm text-muted-foreground">{lang.description}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <ScrollText className="w-4 h-4 text-primary" />
                    <span className="text-sm">Available Levels:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {lang.level.map((level) => (
                      <span key={level} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {level}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Gem className="w-4 h-4 text-primary" />
                    <span className="text-sm">{lang.cultural}</span>
                  </div>
                </div>

                <Button 
                  onClick={() => handleStartLearning()}
                  className="mt-6 w-full"
                >
                  Start Learning
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Language News Section */}
      <div className="container mx-auto px-4 py-16 border-t">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Latest Language News</h2>
          <p className="text-muted-foreground">
            Stay updated with the latest developments in African languages
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {languageStories.map((story) => (
            <StoryCard key={story.slug} {...story} />
          ))}
        </div>
      </div>
    </div>
  )
}
