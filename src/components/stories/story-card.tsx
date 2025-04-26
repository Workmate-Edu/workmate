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
  return (
    <Link 
      href={`/stories/${slug}`}
      className="group block h-[280px] bg-card rounded-lg border shadow-sm hover:shadow-md transition-all"
    >
      <div className="p-6 h-full flex flex-col">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{date}</span>
          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
            {category}
          </span>
        </div>

        <h3 className="text-lg font-semibold mt-3 mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {title}
        </h3>

        <p className="text-sm text-muted-foreground flex-grow line-clamp-3">
          {excerpt}
        </p>

        <span className="mt-4 text-sm font-medium text-primary group-hover:underline">
          Read More →
        </span>
      </div>
    </Link>
  )
}
