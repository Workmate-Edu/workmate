'use client'

import { useEffect, useState, useRef } from "react"
import { ArrowLeft, Calendar, Tag, MessageCircle, ThumbsUp, Share2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useSession } from "next-auth/react"
import { BlogCard } from "@/components/blog/blog-card"

interface BlogPost {
  title: string
  subtitle?: string
  date?: string
  author?: string | { name?: string }
  category?: string
  content: string
  image?: string
  imageCredit?: string
  createdAt?: string
  tags?: string[]
  likes?: string[] | number
  comments?: { user: any; content: string; createdAt: string }[]
}

export default function BlogDetailPage({ params }: { params: { slug: string } }) {
  const [blog, setBlog] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [likeLoading, setLikeLoading] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [commentInput, setCommentInput] = useState("")
  const [commentLoading, setCommentLoading] = useState(false)
  const [comments, setComments] = useState<BlogPost["comments"]>([])
  const [justCommented, setJustCommented] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [allBlogs, setAllBlogs] = useState<BlogPost[]>([])
  const commentInputRef = useRef<HTMLInputElement>(null)
  const { data: session } = useSession()

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true)
      // 1. Fetch blog (does NOT increment viewCount)
      const res = await fetch(`/api/blog/${params.slug}`)
      if (res.ok) {
        const data = await res.json()
        setBlog({
          ...data,
          image: data.image && typeof data.image === "string" && data.image.startsWith("http")
            ? data.image
            : undefined
        })
        setLikesCount(Array.isArray(data.likes) ? data.likes.length : (typeof data.likes === "number" ? data.likes : 0))
        setLiked(Array.isArray(data.likes) && session?.user ? data.likes.includes(session.user.id) : false)
        setComments(Array.isArray(data.comments) ? data.comments : [])
        // 2. Increment view count and update state with new viewCount using PUT
        fetch(`/api/blog/${params.slug}/view`, { method: "PUT" })
          .then(r => r.ok ? r.json() : null)
          .then(updated => {
            if (updated && typeof updated.viewCount === "number") {
              setBlog(prev => prev ? { ...prev, viewCount: updated.viewCount } : prev)
            }
          })
      }
      setLoading(false)
    }
    fetchBlog()
    // eslint-disable-next-line
  }, [params.slug, session?.user])

  // Fetch all blogs for similar topics
  useEffect(() => {
    fetch("/api/blog?status=published")
      .then(res => res.ok ? res.json() : [])
      .then(data => setAllBlogs(data))
  }, [])

  const handleLike = async () => {
    if (!session?.user) return
    setLikeLoading(true)
    const res = await fetch(`/api/blog/${params.slug}/like`, { method: "POST" })
    if (res.ok) {
      const data = await res.json()
      setLiked(data.liked)
      setLikesCount(data.likes)
    }
    setLikeLoading(false)
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentInput.trim() || !session?.user) return
    setCommentLoading(true)
    const res = await fetch(`/api/blog/${params.slug}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: commentInput })
    })
    if (res.ok) {
      setCommentInput("")
      setJustCommented(true)
      // Refetch comments
      const blogRes = await fetch(`/api/blog/${params.slug}`)
      if (blogRes.ok) {
        const data = await blogRes.json()
        setComments(Array.isArray(data.comments) ? data.comments : [])
      }
      setTimeout(() => setJustCommented(false), 2000)
    }
    setCommentLoading(false)
  }

  // Helper for share URLs
  const blogUrl = typeof window !== "undefined"
    ? window.location.origin + `/blog/${params.slug}`
    : `https://yourdomain.com/blog/${params.slug}`

  const shareTitle = blog?.title || "Check out this blog on Workmate!"
  const shareDesc = blog?.subtitle || ""
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(blogUrl)}`
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(blogUrl)}`
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(shareTitle + " " + blogUrl)}`
  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(blogUrl)}&text=${encodeURIComponent(shareTitle)}`

  if (loading) {
    return (
      <main className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 max-w-3xl flex items-center justify-center min-h-[400px]">
          <span className="loader" />
        </div>
      </main>
    )
  }

  if (!blog) {
    return (
      <main className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-red-500">Blog not found.</div>
        </div>
      </main>
    )
  }

  // Find similar blogs by tags or category
  let similarBlogs: BlogPost[] = []
  if (blog && allBlogs.length > 0) {
    const blogTags = Array.isArray(blog.tags) ? blog.tags : []
    const blogCategories = Array.isArray(blog.category) ? blog.category : blog.category ? [blog.category] : []
    similarBlogs = allBlogs
      .filter(b =>
        b.slug !== params.slug &&
        (
          (b.tags && blogTags.some(tag => b.tags?.includes(tag))) ||
          (b.category && blogCategories.some(cat => (Array.isArray(b.category) ? b.category : [b.category]).includes(cat)))
        )
      )
      .slice(0, 6)
  }

  return (
    <main className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link href="/blog" className="inline-block mb-8">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Button>
        </Link>

        <article className="prose prose-slate dark:prose-invert max-w-none">
          {/* Blog Image */}
          {blog.image && (
            <div className="mb-6 flex flex-col items-center">
              <img
                src={blog.image}
                alt={blog.title}
                className="rounded shadow-lg max-h-80 w-full object-cover border border-muted"
                style={{ maxWidth: 700 }}
                onError={e => (e.currentTarget.style.display = "none")}
              />
              {blog.imageCredit && (
                <div className="text-xs text-muted-foreground mt-1 italic text-center">
                  {blog.imageCredit}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4 flex-wrap">
            {/* Meta info */}
            {blog.createdAt && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(blog.createdAt).toLocaleDateString()}
              </div>
            )}
            {blog.author && (
              <div className="flex items-center gap-2">
                <span className="font-medium">By:</span>
                <span>
                  {typeof blog.author === "object"
                    ? blog.author.name || "Unknown"
                    : blog.author}
                </span>
              </div>
            )}
            {blog.category && (
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                {Array.isArray(blog.category)
                  ? blog.category.map((cat, idx) => (
                      <span
                        key={cat}
                        className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mr-2"
                        style={{ marginRight: idx < blog.category.length - 1 ? "0.5rem" : 0 }}
                      >
                        {cat}
                      </span>
                    ))
                  : <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">{blog.category}</span>
                }
              </div>
            )}
            {Array.isArray(blog.tags) && blog.tags.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Tags:</span>
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {typeof blog.viewCount === "number" && (
              <div className="flex items-center gap-2">
                <span role="img" aria-label="views">👁️</span>
                <span>{blog.viewCount} views</span>
              </div>
            )}
          </div>

          {/* Title and Subtitle */}
          <h1 className="mb-2 text-3xl font-bold leading-tight">{blog.title}</h1>
          {blog.subtitle && (
            <h2 className="mb-4 text-xl text-muted-foreground font-medium leading-snug">{blog.subtitle}</h2>
          )}

          <div
            dangerouslySetInnerHTML={{ __html: blog.content }}
            className="blog-content"
          />

          <style jsx global>{`
            .blog-content a {
              color: #2563eb;
              text-decoration: underline;
              transition: color 0.2s;
            }
            .blog-content a:hover {
              color: #1d4ed8;
              background: #e0e7ff;
            }
          `}</style>

          {/* Like and Comment Actions */}
          <div className="flex items-center gap-6 mt-8 mb-6">
            <button
              className={`flex items-center gap-2 px-3 py-1 rounded-full border ${liked ? "bg-primary text-white border-primary" : "bg-muted text-primary border-muted"}`}
              onClick={handleLike}
              disabled={likeLoading || !session?.user}
              title={session?.user ? "Like this post" : "Sign in to like"}
              type="button"
            >
              <ThumbsUp className="w-4 h-4" />
              <span>{likesCount}</span>
              <span className="sr-only">Like</span>
            </button>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              <span>{comments.length}</span>
              <span className="sr-only">Comments</span>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="flex items-center gap-4 mt-4 mb-8">
            <button
              type="button"
              className="flex items-center gap-2 px-3 py-1 rounded-full border bg-muted text-primary border-muted hover:bg-primary/10 transition"
              onClick={() => setShareOpen(!shareOpen)}
              title="Share this blog"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
            {shareOpen && (
              <div className="flex gap-2">
                <a
                  href={facebookShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
                  title="Share on Facebook"
                >
                  Facebook
                </a>
                <a
                  href={linkedinShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded-full bg-blue-800 text-white text-xs font-semibold hover:bg-blue-900 transition"
                  title="Share on LinkedIn"
                >
                  LinkedIn
                </a>
                <a
                  href={whatsappShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded-full bg-green-500 text-white text-xs font-semibold hover:bg-green-600 transition"
                  title="Share on WhatsApp"
                >
                  WhatsApp
                </a>
                <a
                  href={telegramShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded-full bg-cyan-500 text-white text-xs font-semibold hover:bg-cyan-600 transition"
                  title="Share on Telegram"
                >
                  Telegram
                </a>
              </div>
            )}
          </div>

          {/* Comment Form */}
          {session?.user && (
            <form onSubmit={handleComment} className="mb-8 flex gap-2">
              <input
                ref={commentInputRef}
                className="flex-1 border rounded px-3 py-2"
                placeholder="Add a comment..."
                value={commentInput}
                onChange={e => setCommentInput(e.target.value)}
                disabled={commentLoading}
              />
              <Button type="submit" disabled={commentLoading || !commentInput.trim()}>
                {commentLoading ? "Posting..." : "Post"}
              </Button>
              {justCommented && (
                <span className="ml-3 text-green-600 text-sm font-medium">Comment posted!</span>
              )}
            </form>
          )}

          {/* Comments List */}
          <div className="mb-8">
            {comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((c, idx) => (
                  <div key={idx} className="border-b pb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-primary">
                        {typeof c.user === "object"
                          ? c.user?.name || "User"
                          : typeof c.user === "string"
                            ? c.user
                            : "User"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ""}
                      </span>
                    </div>
                    <div className="text-sm">{c.content}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">No comments yet.</div>
            )}
          </div>

          {/* Similar Blogs Section */}
          {similarBlogs.length > 0 && (
            <div className="mt-12">
              <h3 className="text-xl font-semibold mb-4">Similar Blogs</h3>
              <div className="grid sm:grid-cols-2 gap-6">
                {similarBlogs.map(similar => (
                  <BlogCard
                    key={similar._id}
                    blog={similar}
                    href={`/blog/${similar.slug}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Optionally, add related topics or author info here */}
        </article>
      </div>
    </main>
  )
}
