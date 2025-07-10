'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface BlogStory {
  _id: string
  slug: string
  title: string
  excerpt?: string
  subtitle?: string
  content: string
  createdAt: string
  category?: string | string[]
  image?: string
}

const CARD_BG_GRADIENTS = [
  'from-yellow-50 via-orange-50 to-yellow-100',
  'from-green-50 via-teal-50 to-green-100',
  'from-blue-50 via-indigo-50 to-blue-100',
  'from-pink-50 via-fuchsia-50 to-pink-100',
  'from-purple-50 via-violet-50 to-purple-100',
  'from-emerald-50 via-lime-50 to-emerald-100',
]

const CARD_ACCENTS = [
  'border-yellow-200 shadow-yellow-100',
  'border-green-200 shadow-green-100',
  'border-blue-200 shadow-blue-100',
  'border-pink-200 shadow-pink-100',
  'border-purple-200 shadow-purple-100',
  'border-emerald-200 shadow-emerald-100',
]

const EMOJI_LIST = [
  '📚',
  '🌍',
  '🎉',
  '🧠',
  '🚀',
  '💡',
  '📝',
  '🌟',
  '🎓',
  '🦁',
  '🧩',
  '🦜',
]

function getCardStyle(idx: number) {
  return {
    bg: `bg-gradient-to-br ${CARD_BG_GRADIENTS[idx % CARD_BG_GRADIENTS.length]}`,
    accent: `${CARD_ACCENTS[idx % CARD_ACCENTS.length]}`,
  }
}

function getEmoji(idx: number) {
  return EMOJI_LIST[idx % EMOJI_LIST.length]
}

export function NewsStoriesSection() {
  const [stories, setStories] = useState<BlogStory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStories() {
      setLoading(true)
      const res = await fetch('/api/blog?status=published')
      const data = res.ok ? await res.json() : []
      setStories(data.slice(0, 6)) // Show up to 6 latest stories
      setLoading(false)
    }
    fetchStories()
  }, [])

  return (
    <section className="py-16 bg-gradient-to-br from-background via-muted/5 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Latest in African Education</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Stay updated with recent developments in African languages and education
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-3 text-center text-muted-foreground">Loading...</div>
          ) : stories.length === 0 ? (
            <div className="col-span-3 text-center text-muted-foreground">No stories found.</div>
          ) : (
            stories.map((story, idx) => {
              const { bg, accent } = getCardStyle(idx)
              const emoji = getEmoji(idx)
              return (
                <Link key={story.slug} href={`/blog/${story.slug}`}>
                  <div
                    className={`cursor-pointer h-full rounded-2xl border-2 ${bg} ${accent} shadow-lg hover:scale-[1.025] hover:shadow-xl transition-all duration-200 flex flex-col group relative overflow-hidden`}
                    style={{ minHeight: 320 }}
                  >
                    {/* Fun Emoji Top Left */}
                    <div className="absolute left-4 top-4 text-3xl md:text-4xl select-none pointer-events-none animate-bounce-slow">
                      {emoji}
                    </div>
                    {/* Decorative Confetti */}
                    <div className="absolute right-4 top-4 opacity-30 text-2xl pointer-events-none select-none">
                      🎊
                    </div>
                    {/* Decorative Doodle Bottom Right */}
                    <div className="absolute bottom-4 right-4 opacity-20 text-2xl pointer-events-none select-none">
                      🖍️
                    </div>
                    {/* Card Content */}
                    <div className="flex-1 flex flex-col justify-between p-7 pt-16">
                      <div>
                        <div className="mb-2 flex flex-wrap gap-2">
                          {Array.isArray(story.category)
                            ? story.category.map((cat, i) => (
                                <span key={cat} className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                                  {cat}
                                </span>
                              ))
                            : story.category && (
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                                  {story.category}
                                </span>
                              )}
                        </div>
                        <h3 className="text-xl font-extrabold mb-2 line-clamp-2 text-primary group-hover:underline">
                          {story.title}
                        </h3>
                        <div className="text-muted-foreground text-base mb-3 line-clamp-2">
                          {story.subtitle ||
                            story.excerpt ||
                            (typeof story.content === 'string'
                              ? story.content.replace(/<[^>]+>/g, '').slice(0, 120) + (story.content.length > 120 ? '...' : '')
                              : '')}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-xs text-muted-foreground font-semibold">
                          {story.createdAt && new Date(story.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-xs font-bold text-primary group-hover:text-secondary transition">
                          Read Story &rarr;
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </div>
    </section>
  )
}

