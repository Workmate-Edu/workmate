'use client'

import { StoryCard } from '@/components/stories/story-card'

export default function StoriesPage() {
  const stories = [
    {
      slug: 'niger-adopts-hausa',
      title: 'Niger Adopts Hausa as Official Language',
      excerpt: 'Niger has officially recognized Hausa as an official language, promoting African language education and cultural preservation.',
      date: 'January 2024',
      category: 'Language Policy'
    },
    {
      slug: 'african-startups-revolutionizing-financial-technology',
      title: 'African Startups Revolutionizing Financial Technology',
      excerpt: 'How African fintech companies are leading digital transformation across the continent',
      date: 'February 2024',
      category: 'Innovation'
    },
    {
      slug: 'solar-energy-solutions-transform-rural-education',
      title: 'Solar Energy Solutions Transform Rural Education',
      excerpt: 'Innovation in renewable energy bringing power to remote schools',
      date: 'February 2024',
      category: 'Technology'
    },
    {
      slug: 'young-african-scientists-making-global-impact',
      title: 'Young African Scientists Making Global Impact',
      excerpt: 'Meet the next generation of African innovators changing the world',
      date: 'February 2024',
      category: 'Development'
    }
  ]

  return (
    <main className="min-h-screen bg-background py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">African Innovation Stories</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover the latest developments in African technology, innovation, and entrepreneurship
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {['All', 'Innovation', 'Technology', 'Startups', 'Science', 'Education'].map((category) => (
            <button
              key={category}
              className="px-4 py-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              {category}
            </button>
          ))}
        </div>

        {/* Stories Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <StoryCard key={story.slug} {...story} />
          ))}
        </div>
      </div>
    </main>
  )
}
