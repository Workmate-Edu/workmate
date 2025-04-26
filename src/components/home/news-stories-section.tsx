'use client'

import { StoryCard } from '@/components/stories/story-card'

export function NewsStoriesSection() {
  const stories = [
    {
      slug: 'niger-adopts-hausa',
      title: 'Niger Adopts Hausa as Official Language',
      excerpt: 'Niger has officially recognized Hausa as an official language, marking a significant step in African language policy.',
      date: 'January 2024',
      category: 'Language Policy'
    },
    {
      slug: 'stem-africa-initiative',
      title: 'Major STEM Initiative Launches in West Africa',
      excerpt: 'New educational program combines traditional African knowledge with modern STEM curriculum.',
      date: 'February 2024',
      category: 'Education'
    },
    {
      slug: 'digital-language-learning',
      title: 'African Languages in Digital Age',
      excerpt: 'Growing trend of African language learning apps and digital platforms supporting cultural education.',
      date: 'February 2024',
      category: 'Technology'
    }
  ]

  return (
    <section className="py-16 bg-muted/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Latest in African Education</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Stay updated with recent developments in African languages and education
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <StoryCard key={story.slug} {...story} />
          ))}
        </div>
      </div>
    </section>
  )
}
