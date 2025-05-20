import { Calendar } from 'lucide-react'
import Link from 'next/link'

interface StoryCardProps {
  slug: string
  title: string
  excerpt: string
  date: string
  category: string
}

export function StoryCard({ slug, title, excerpt, date, category }: StoryCardProps) {
  // Get gradient based on category
  const getGradient = (category: string) => {
    switch (category.toLowerCase()) {
      case 'language policy':
        return 'from-blue-500/20 to-indigo-500/20 hover:from-blue-500/30 hover:to-indigo-500/30'
      case 'education':
        return 'from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30'
      case 'technology':
        return 'from-violet-500/20 to-purple-500/20 hover:from-violet-500/30 hover:to-purple-500/30'
      default:
        return 'from-gray-500/20 to-slate-500/20 hover:from-gray-500/30 hover:to-slate-500/30'
    }
  }

  return (
    <Link 
      href={`/stories/${slug}`}
      className="block group"
    >
      <article className={`h-full rounded-lg p-6 transition-all duration-300 bg-gradient-to-br backdrop-blur-sm ${getGradient(category)} border border-white/10`}>
        <div className="space-y-4">
          <div className="space-y-2">
            <span className="text-sm font-medium text-primary">{category}</span>
            <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
              {title}
            </h3>
          </div>
          <p className="text-muted-foreground">{excerpt}</p>
          <div className="text-sm text-muted-foreground">{date}</div>
        </div>
      </article>
    </Link>
  )
}
