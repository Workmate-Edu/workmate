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
    icon: '🎭',
    gradient: 'from-[#FF6B6B]/10 via-[#FF8E53]/10 to-[#FFA726]/10'
  },
  {
    name: 'Swahili',
    description: "Learn East Africa's most spoken language",
    level: ['Beginner', 'Intermediate', 'Advanced'],
    cultural: 'East African Culture',
    icon: '🌊', // Ocean wave representing coastal culture
    gradient: 'bg-gradient-to-br from-[#00CED1]/10 to-[#4169E1]/10 hover:from-[#00CED1]/20 hover:to-[#4169E1]/20',
    culturalImage: '⛵' // Dhow sailing vessel
  },
  {
    name: 'Hausa',
    description: 'Master the lingua franca of Northern Nigeria',
    level: ['Beginner', 'Intermediate'],
    cultural: 'Hausa Culture & Traditions',
    icon: '🐪', // Camel representing Sahel trade
    gradient: 'bg-gradient-to-br from-[#FFD700]/10 to-[#DAA520]/10 hover:from-[#FFD700]/20 hover:to-[#DAA520]/20',
    culturalImage: '🏰' // Traditional architecture
  },
  {
    name: 'Igbo',
    description: 'Discover the language of the Igbo people',
    level: ['Beginner', 'Intermediate'],
    cultural: 'Igbo Heritage',
    icon: '🎋', // Palm wine tapping symbol
    gradient: 'bg-gradient-to-br from-[#32CD32]/10 to-[#006400]/10 hover:from-[#32CD32]/20 hover:to-[#006400]/20',
    culturalImage: '🎭' // Masquerade culture
  },
  {
    name: 'Arabic',
    description: 'Learn Classical and Modern Arabic',
    level: ['Beginner', 'Intermediate', 'Advanced'],
    cultural: 'Arabic Literature & Culture',
    icon: '📜', // Ancient scroll
    gradient: 'bg-gradient-to-br from-[#B8860B]/10 to-[#CD853F]/10 hover:from-[#B8860B]/20 hover:to-[#CD853F]/20',
    culturalImage: '🕌' // Islamic architecture
  }
]

export default function LanguagesPage() {
  const router = useRouter()
  const { data: session } = useSession()

  const handleStartLearning = (language: string) => {
    if (!session) {
      router.push('/sign-in')
      return
    }
    router.push(`/dashboard/learn/${language.toLowerCase()}`)
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
          
          {/* <div className="flex flex-wrap justify-center gap-4 mt-6">
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
          </div> */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {languages.map((lang) => (
            <div 
              key={lang.name} 
              className={`group relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br ${lang.gradient} 
                hover:border-primary/50 hover:shadow-lg transition-all duration-300 
                hover:-translate-y-1 backdrop-blur-sm`}
            >
              <div className="relative p-6 z-10">
                {/* Animated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-background/80 to-background/20 opacity-0 
                  group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="flex items-center gap-4 mb-4 relative">
                  <span className="text-4xl transform group-hover:scale-110 transition-transform duration-300">
                    {lang.icon}
                  </span>
                  <div>
                    <div className="text-sm text-primary font-medium">{lang.cultural}</div>
                    <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                      {lang.name}
                    </h3>
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
                  onClick={() => handleStartLearning(lang.name)}
                  className="mt-6 w-full bg-primary/90 hover:bg-primary shadow-sm 
                    hover:shadow-lg transition-all duration-300 cursor-pointer 
                    relative z-20"
                >
                  Start Learning
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>


      {/* <div className="container mx-auto px-4 py-16 border-t">
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
      </div> */}
    </div>
  )
}
