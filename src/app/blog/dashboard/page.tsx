'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import { BlogCard } from "@/components/blog/blog-card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Loading from "@/app/loading"
import { Bar } from "react-chartjs-2"
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js"
import { useSession } from "next-auth/react"
import { ChevronDown, MessageCircle, ThumbsUp } from "lucide-react"

interface BlogComment {
  user: any; // user can be object or string
  content: string;
  createdAt: string;
}

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
  viewCount?: number
}

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

type StatsMap = Record<string, number>
type RawStats = { [key in "published" | "drafts" | "all"]: StatsMap }

export default function BlogDashboardPage() {
  const [published, setPublished] = useState<BlogPost[]>([])
  const [drafts, setDrafts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [rawStats, setRawStats] = useState<RawStats>({
    published: {},
    drafts: {},
    all: {},
  })
  const [filter, setFilter] = useState<"published" | "drafts" | "all">("published")
  const [allBlogs, setAllBlogs] = useState<BlogPost[]>([])
  const [showAll, setShowAll] = useState(false)
  const [commentReply, setCommentReply] = useState<{ blogId: string, commentIdx: number, value: string } | null>(null)
  const [replyLoading, setReplyLoading] = useState(false)

  const router = useRouter()
  const { data: session, status } = useSession()
  const isAdmin = session?.user?.role === "admin"

  // Helper: build stats for a list of blogs
  const buildStats = (blogs: BlogPost[]): StatsMap => {
    const catCounts: Record<string, number> = {}
    const tagCounts: Record<string, number> = {}
    let views = 0

    blogs.forEach(b => {
      if (Array.isArray(b.category)) {
        b.category.forEach(c => { catCounts[c] = (catCounts[c] || 0) + 1 })
      } else if (typeof b.category === "string") {
        catCounts[b.category] = (catCounts[b.category] || 0) + 1
      }
      if (Array.isArray(b.tags)) {
        b.tags.forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1 })
      }
      views += b.viewCount ?? 0
    })

    const MAX_TAGS = 5
    const sortedTags = Object.entries(tagCounts).sort(([,a],[,b]) => b - a)
    const topTags = sortedTags.slice(0, MAX_TAGS).map(([tag]) => tag)
    const otherCount = sortedTags.slice(MAX_TAGS).reduce((sum, [,c]) => sum + c, 0)

    const stats: StatsMap = { count: blogs.length, views, ...catCounts }
    topTags.forEach(tag => { stats[tag] = tagCounts[tag] })
    if (otherCount > 0) stats["Other tags"] = otherCount

    return stats
  }

  // Initial fetch
  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true)
      const [pubRes, drfRes] = await Promise.all([
        fetch("/api/blog?status=published&mine=1"),
        fetch("/api/blog?status=draft&mine=1"),
      ])
      const publishedData: BlogPost[] = pubRes.ok ? await pubRes.json() : []
      const draftsData: BlogPost[] = drfRes.ok ? await drfRes.json() : []
      setPublished(publishedData)
      setDrafts(draftsData)
      setLoading(false)
    }
    fetchBlogs()
  }, [])

  // Recompute stats on change
  useEffect(() => {
    setRawStats({
      published: buildStats(published),
      drafts:   buildStats(drafts),
      all:      buildStats([...published, ...drafts])
    })
  }, [published, drafts])

  // Fetch all blogs for admin/blogger
  useEffect(() => {
    if (!showAll) return
    setLoading(true)
    fetch("/api/blog")
      .then(res => res.ok ? res.json() : [])
      .then(data => setAllBlogs(data))
      .finally(() => setLoading(false))
  }, [showAll])

  // Change: Pass onDeleteClick to BlogCard so delete modal opens
  const handleDelete = (id: string) => setDeleteId(id)

  const confirmDelete = async () => {
    if (!deleteId) return
    setDeleteLoading(true)
    const res = await fetch(`/api/blog?id=${deleteId}`, { method: "DELETE" })
    if (res.ok) {
      setPublished(p => p.filter(b => b._id !== deleteId))
      setDrafts(d => d.filter(b => b._id !== deleteId))
      setDeleteId(null)
    }
    setDeleteLoading(false)
  }

  // Handler to reply to a comment
  const handleReply = async (blogId: string, commentIdx: number, reply: string) => {
    setReplyLoading(true)
    const blog = allBlogs.find(b => b._id === blogId)
    if (!blog) return
    const slug = blog.slug
    const comment = blog.comments?.[commentIdx]
    if (!slug || !comment) return
    // You may want to store replies as a subfield or just as a new comment by "Workmate"
    const res = await fetch(`/api/blog/${slug}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: reply })
    })
    if (res.ok) {
      // Refetch all blogs to update comments
      fetch("/api/blog")
        .then(res => res.ok ? res.json() : [])
        .then(data => setAllBlogs(data))
      setCommentReply(null)
    }
    setReplyLoading(false)
  }

  if (status !== "loading" && (!session?.user || (!session.user.blogger && !isAdmin))) {
    return (
      <div className="max-w-2xl mx-auto py-24 text-center text-lg text-muted-foreground">
        You do not have access to the blog dashboard.
      </div>
    )
  }

  // Prepare chart data
  const stats = rawStats[filter]
  const chartLabels = [
    filter === "all" ? "All Posts" : filter === "published" ? "Published" : "Drafts",
    "Views",
    ...Object.keys(stats).filter(label => !["count", "views"].includes(label))
  ]

  const brandPrimary   = "#2563eb"
  const brandSecondary = "#facc15"
  const brandAccent    = "#22c55e"
  const brandMuted     = "#f1f5f9"

  const chartData = {
    labels: chartLabels,
    datasets: [{
      label: "Count",
      data: chartLabels.map(label => {
        if (label === "Views") return stats.views ?? 0
        if (label === (filter === "all" ? "All Posts" : filter === "published" ? "Published" : "Drafts")) {
          return stats.count ?? 0
        }
        return stats[label] ?? 0
      }),
      backgroundColor: [
        brandPrimary,
        brandSecondary,
        brandAccent,
        "#a78bfa",
        "#f472b6",
        "#f59e42",
        "#f87171",
        "#34d399"
      ],
      borderRadius: 8,
      borderSkipped: false,
      barPercentage: 0.7,
      categoryPercentage: 0.7
    }]
  }

  // Helper to get user name from comment (same logic as blog detail page)
  function getUserName(user: any) {
    if (!user) return "User";
    if (typeof user === "object" && user.name) return user.name;
    if (typeof user === "object" && user._id) return user._id; // fallback if no name
    if (typeof user === "string") return user;
    return "User";
  }

  return (
    <div className="max-w-4xl mx-auto py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Blog Dashboard</h1>
        <Link
          href="/blog/create"
          className="bg-primary text-white px-4 py-2 rounded font-semibold hover:bg-primary/90 transition"
        >
          + Create Blog
        </Link>
      </div>

      {/* Filter Dropdown (Admin only) */}
      {isAdmin && (
        <div className="mb-6">
          <label htmlFor="viewFilter" className="block mb-1 text-sm font-medium text-gray-700">
            Show:
          </label>
          <div className="relative inline-block w-40">
            <select
              id="viewFilter"
              value={filter}
              onChange={e => setFilter(e.target.value as any)}
              className="block w-full appearance-none bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 pr-8 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            >
              <option value="published">Published</option>
              <option value="drafts">Drafts</option>
              <option value="all">All</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
      )}

      {/* Admin Chart */}
      {isAdmin && (
        <div className="mb-8 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            Blog Overview ({filter.charAt(0).toUpperCase() + filter.slice(1)})
          </h3>
          <div className="w-full h-80">
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                layout: { padding: { top: 16, bottom: 16, left: 8, right: 8 } },
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: brandPrimary,
                    titleColor: "#fff",
                    bodyColor: "#fff",
                    borderColor: brandAccent,
                    borderWidth: 1,
                    padding: 10,
                    cornerRadius: 6,
                    displayColors: false
                  }
                },
                scales: {
                  x: {
                    grid: { display: false },
                    ticks: {
                      color: brandPrimary,
                      font: { size: 12, weight: "500" },
                      autoSkip: true,
                      maxRotation: 45,
                      minRotation: 0
                    }
                  },
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: brandMuted,
                      borderDash: [4, 4]
                    },
                    ticks: {
                      color: brandPrimary,
                      font: { size: 12, weight: "500" }
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Toggle to show all blogs for admin/blogger */}
      {(isAdmin || session?.user?.blogger) && (
        <div className="mb-6 flex justify-end">
          <Button
            variant={showAll ? "default" : "outline"}
            onClick={() => setShowAll(v => !v)}
          >
            {showAll ? "Show My Blogs" : "Show All Blogs"}
          </Button>
        </div>
      )}

      {/* All Blogs Table for admin/blogger */}
      {showAll && (isAdmin || session?.user?.blogger) && (
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4">All Blogs</h2>
          {loading ? (
            <Loading />
          ) : allBlogs.length === 0 ? (
            <div className="text-muted-foreground">No blogs found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border rounded bg-white">
                <thead>
                  <tr className="bg-muted">
                    <th className="px-4 py-2 text-left">Title</th>
                    <th className="px-4 py-2 text-left">Author</th>
                    <th className="px-4 py-2 text-center">Likes</th>
                    <th className="px-4 py-2 text-center">Comments</th>
                    <th className="px-4 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allBlogs.map(blog => (
                    <tr key={blog._id} className="border-b">
                      <td className="px-4 py-2">
                        <Link href={`/blog/${blog.slug}`} className="text-primary underline">
                          {blog.title}
                        </Link>
                      </td>
                      <td className="px-4 py-2">{typeof blog.author === "object" ? blog.author?.name : blog.author}</td>
                      <td className="px-4 py-2 text-center">
                        <span className="inline-flex items-center gap-1">
                          <ThumbsUp className="w-4 h-4 inline" />
                          {Array.isArray(blog.likes) ? blog.likes.length : (typeof blog.likes === "number" ? blog.likes : 0)}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span className="inline-flex items-center gap-1">
                          <MessageCircle className="w-4 h-4 inline" />
                          {Array.isArray(blog.comments) ? blog.comments.length : 0}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/blog/edit/${blog.slug}`)}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Comments and reply section */}
          {allBlogs.map(blog => (
            <div key={blog._id} className="mt-6 mb-8 border rounded p-4 bg-muted/10">
              <div className="font-semibold mb-2">{blog.title}</div>
              {Array.isArray(blog.comments) && blog.comments.length > 0 ? (
                <div className="space-y-4">
                  {blog.comments.map((c: BlogComment, idx: number) => (
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
                      <div className="text-sm mb-2">{c.content}</div>
                      {/* Reply button for admin/blogger */}
                      {(isAdmin || session?.user?.blogger) && (
                        <div>
                          {commentReply && commentReply.blogId === blog._id && commentReply.commentIdx === idx ? (
                            <form
                              onSubmit={e => {
                                e.preventDefault()
                                handleReply(blog._id, idx, commentReply.value)
                              }}
                              className="flex gap-2 mt-2"
                            >
                              <input
                                className="flex-1 border rounded px-2 py-1"
                                placeholder="Write a reply..."
                                value={commentReply.value}
                                onChange={e =>
                                  setCommentReply(r =>
                                    r ? { ...r, value: e.target.value } : null
                                  )
                                }
                                disabled={replyLoading}
                              />
                              <Button type="submit" size="sm" disabled={replyLoading || !commentReply.value.trim()}>
                                {replyLoading ? "Replying..." : "Reply"}
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => setCommentReply(null)}
                              >
                                Cancel
                              </Button>
                            </form>
                          ) : (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => setCommentReply({ blogId: blog._id, commentIdx: idx, value: "" })}
                            >
                              Reply
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground text-sm">No comments yet.</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Summary Cards & Blog Lists */}
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="flex gap-8 mb-8">
            <div className="flex-1 bg-green-50 p-4 rounded">
              <div className="text-2xl font-bold">{published.length}</div>
              <div className="text-green-700">Published</div>
            </div>
            <div className="flex-1 bg-yellow-50 p-4 rounded">
              <div className="text-2xl font-bold">{drafts.length}</div>
              <div className="text-yellow-700">Drafts</div>
            </div>
          </div>

          {/* Published Blogs */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Published Blogs</h2>
            {published.length === 0 ? (
              <div className="text-muted-foreground">No published blogs yet.</div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {published.map(blog => (
                  <BlogCard
                    key={blog._id}
                    blog={blog}
                    showView
                    onViewClick={() => window.open(`/blog/${blog.slug}`, "_blank")}
                    showEdit={() => router.push(`/blog/edit/${blog.slug}`)}
                    showDelete
                    onDeleteClick={() => handleDelete(blog._id)} // <-- ensure this is passed
                  />
                ))}
              </div>
            )}
          </div>

          {/* Draft Blogs */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Draft Blogs</h2>
            {drafts.length === 0 ? (
              <div className="text-muted-foreground">No drafts.</div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {drafts.map(blog => (
                  <BlogCard
                    key={blog._id}
                    blog={blog}
                    showView
                    onViewClick={() => window.open(`/blog/${blog.slug}`, "_blank")}
                    showEdit={() => router.push(`/blog/edit/${blog.slug}`)}
                    showDelete
                    onDeleteClick={() => handleDelete(blog._id)} // <-- ensure this is passed
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Blog Post</DialogTitle>
          </DialogHeader>
          <div className="mb-4">
            Are you sure you want to delete this blog post? This action cannot be undone.
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={deleteLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteLoading}>
              {deleteLoading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
