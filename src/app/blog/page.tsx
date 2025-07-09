'use client'

import { useEffect, useState } from "react"
import { BlogCard } from "@/components/blog/blog-card"
import Loading from "../loading"
import Link from "next/link"

interface BlogPost {
  _id: string
  title: string
  subtitle?: string
  content: string
  tags?: string[]
  category?: string | string[]
  status: "published" | "draft"
  createdAt: string
  slug: string
  image?: string
  author?: { name?: string }
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "title", label: "Title (A-Z)" }
]

// Tag color palette and color function (same as BlogCard)
const TAG_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-yellow-100 text-yellow-700",
  "bg-purple-100 text-purple-700",
  "bg-pink-100 text-pink-700",
  "bg-orange-100 text-orange-700",
  "bg-teal-100 text-teal-700",
  "bg-red-100 text-red-700"
]
function getTagColor(tag: string, idx: number) {
  let hash = 0
  for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash)
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length] || TAG_COLORS[idx % TAG_COLORS.length]
}

export default function BlogListPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState("newest")
  const [tagFilter, setTagFilter] = useState<string | null>(null)

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true)
      const res = await fetch("/api/blog?status=published")
      const data = res.ok ? await res.json() : []
      setBlogs(data)
      setLoading(false)
    }
    fetchBlogs()
  }, [])

  // Collect all unique tags for filtering and count blogs per tag
  const tagCounts: Record<string, number> = {}
  blogs.forEach(blog => {
    (blog.tags || []).forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1
    })
  })
  const allTags = Object.keys(tagCounts)

  // Sort and filter blogs
  const sortedBlogs = [...blogs]
    .filter(blog => !tagFilter || (blog.tags || []).includes(tagFilter))
    .sort((a, b) => {
      if (sort === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
      if (sort === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      }
      if (sort === "title") {
        return a.title.localeCompare(b.title)
      }
      return 0
    })

  // Main blog is the first in the sorted list
  const mainBlog = sortedBlogs[0]
  const otherBlogs = sortedBlogs.slice(1, 5) // Show up to 4 on the side

  // For similar topics/tags
  const similarBlogs = (mainBlog && mainBlog.tags && mainBlog.tags.length > 0)
    ? blogs.filter(
        b =>
          b._id !== mainBlog._id &&
          b.tags &&
          b.tags.some(tag => mainBlog.tags?.includes(tag))
      ).slice(0, 6)
    : []

  return (
    <main className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Blog Section */}
          <div className="flex-1 min-w-0">
            <h1 className="text-4xl font-bold mb-2">Workmate Company Blog</h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
              Insights, stories, and updates from the Workmate team on African languages, STEM, and education innovation.
            </p>
            {/* Tag Filter at the top */}
            <div className="mb-6 flex flex-wrap gap-2">
              <button
                className={`px-3 py-1 rounded-full border ${!tagFilter ? "bg-primary text-white border-primary" : "bg-muted text-primary border-muted"}`}
                onClick={() => setTagFilter(null)}
              >
                All
              </button>
              {allTags.map((tag, idx) => (
                <button
                  key={tag}
                  className={`px-3 py-1 rounded-full border flex items-center gap-1 ${tagFilter === tag ? "border-primary bg-primary text-white" : getTagColor(tag, idx) + " border-transparent"}`}
                  onClick={() => setTagFilter(tag)}
                >
                  {tag}
                  <span className="text-xs font-semibold">{tagCounts[tag]}</span>
                </button>
              ))}
            </div>
            {/* Main Blog Card */}
            {loading ? (
              <Loading />
            ) : !mainBlog ? (
              <div className="text-center text-muted-foreground py-12">
                No blog posts found.
              </div>
            ) : (
              <div className="mb-10">
                <Link href={`/blog/${mainBlog.slug}`}>
                  <div className="rounded-lg shadow-lg bg-white dark:bg-background overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group">
                    {mainBlog.image && (
                      <img
                        src={mainBlog.image}
                        alt={mainBlog.title}
                        className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        {Array.isArray(mainBlog.category)
                          ? mainBlog.category.map(cat => (
                              <span key={cat} className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">{cat}</span>
                            ))
                          : mainBlog.category && (
                              <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">{mainBlog.category}</span>
                            )}
                        {Array.isArray(mainBlog.tags) && mainBlog.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {mainBlog.tags.map((tag, idx) => (
                              <span
                                key={tag}
                                className={`px-2 py-1 rounded-full text-xs font-semibold ${getTagColor(tag, idx)}`}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <h2 className="text-2xl font-bold mb-2">{mainBlog.title}</h2>
                      {mainBlog.subtitle && (
                        <h3 className="text-lg text-muted-foreground mb-4">{mainBlog.subtitle}</h3>
                      )}
                      <div className="text-muted-foreground text-sm mb-2">
                        {mainBlog.author && (
                          <span>
                            By {typeof mainBlog.author === "object" ? mainBlog.author.name : mainBlog.author}
                          </span>
                        )}
                        {mainBlog.createdAt && (
                          <span className="ml-2">
                            {new Date(mainBlog.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <div
                        className="prose prose-slate dark:prose-invert max-w-none line-clamp-5"
                        dangerouslySetInnerHTML={{
                          __html: mainBlog.content?.slice(0, 600) + (mainBlog.content?.length > 600 ? "..." : "")
                        }}
                      />
                      <div className="mt-4">
                        <Link
                          href={`/blog/${mainBlog.slug}`}
                          className="inline-block bg-primary text-white px-6 py-2 rounded font-semibold hover:bg-primary/90 transition"
                        >
                          Read More
                        </Link>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )}
            {/* Similar Topics */}
            {similarBlogs.length > 0 && (
              <div className="mt-12">
                <h3 className="text-xl font-semibold mb-4">Similar Topics</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {similarBlogs.map(blog => (
                    <BlogCard
                      key={blog._id}
                      blog={blog}
                      href={`/blog/${blog.slug}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Sidebar: Other Blogs */}
          <aside className="w-full lg:w-[350px] flex-shrink-0">
            <div className="sticky top-24">
              <h3 className="text-lg font-semibold mb-4">Other Blogs</h3>
              {otherBlogs.length === 0 ? (
                <div className="text-muted-foreground">No other blogs.</div>
              ) : (
                <div className="flex flex-col gap-6">
                  {otherBlogs.map(blog => (
                    <Link key={blog._id} href={`/blog/${blog.slug}`}>
                      <div className="flex gap-4 items-center rounded-lg hover:bg-accent/40 transition p-2">
                        {blog.image && (
                          <img
                            src={blog.image}
                            alt={blog.title}
                            className="w-20 h-20 object-cover rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-base truncate">{blog.title}</h4>
                          <div className="text-xs text-muted-foreground truncate">
                            {blog.subtitle}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {blog.createdAt && new Date(blog.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
