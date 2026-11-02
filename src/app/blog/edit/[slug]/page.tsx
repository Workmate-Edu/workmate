'use client'

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import "react-quill/dist/quill.snow.css"
import { useSession } from "next-auth/react"

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false })

const CATEGORY_OPTIONS = [
  "STEM",
  "Language",
  "Africa",
  "Global",
  "Company Update",
  "Child Safety"
]

export default function BlogEditPage({ params }: { params: { slug: string } }) {
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [content, setContent] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageCredit, setImageCredit] = useState("")
  const [categories, setCategories] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false)
  const [blogStatus, setBlogStatus] = useState<"draft" | "published">("draft") // renamed from status
  const fileInputRef = useRef<HTMLInputElement>(null)
  const categoryDropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { data: session, status: sessionStatus } = useSession(); // renamed destructured status

  // Fetch blog data by slug
  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true)
      const res = await fetch(`/api/blog/${params.slug}`)
      if (res.ok) {
        const data = await res.json()
        setTitle(data.title || "")
        setSubtitle(data.subtitle || "")
        setContent(data.content || "")
        setImageUrl(data.image || "")
        setImageCredit(data.imageCredit || "")
        setCategories(Array.isArray(data.category) ? data.category : data.category ? [data.category] : [])
        setTags(Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : [])
        setBlogStatus(data.status || "draft")
      }
      setLoading(false)
    }
    fetchBlog()
    // eslint-disable-next-line
  }, [params.slug])

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!categoryDropdownOpen) return
    function handleClick(e: MouseEvent) {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(e.target as Node)
      ) {
        setCategoryDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [categoryDropdownOpen])

  const handleImageChange = (file: File) => {
    setImage(file)
    setImageUrl(URL.createObjectURL(file))
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageChange(e.dataTransfer.files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleSubmit = async (e: React.FormEvent, newStatus?: "draft" | "published") => {
    e.preventDefault()
    if (newStatus === "published") {
      setPublishing(true)
    } else {
      setSaving(true)
    }
    let uploadedImageUrl = imageUrl
    if (image) {
      const formData = new FormData()
      formData.append("file", image)
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      })
      if (res.ok) {
        const data = await res.json()
        uploadedImageUrl = data.url || data.secure_url
      }
    }
    const res = await fetch(`/api/blog/${params.slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        subtitle,
        content,
        image: uploadedImageUrl,
        imageCredit,
        category: categories,
        tags,
        status: newStatus || blogStatus
      })
    })
    if (res.ok) {
      router.push("/blog/dashboard")
    }
    setSaving(false)
    setPublishing(false)
  }

  // Access control: Only the blog author, admin, or blogger can edit
  if (
    sessionStatus !== "loading" &&
    (!session?.user ||
      (!session.user.blogger && session.user.role !== "admin" && session.user.role !== "teacher" && session.user.role !== "parent"))
  ) {
    return (
      <div className="max-w-2xl mx-auto py-24 text-center text-lg text-muted-foreground">
        You do not have access to edit blogs.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="loader" />
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto py-12">
      <form
        onSubmit={e => handleSubmit(e)}
        className="flex-1 space-y-6 bg-white dark:bg-background p-6 rounded-lg shadow"
      >
        {/* Image Upload */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${dragActive ? "border-primary bg-primary/10" : "border-muted"}`}
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {imageUrl ? (
            <div className="flex flex-col items-center gap-2">
              <img src={imageUrl} alt="Preview" className="max-h-48 rounded mb-2" />
              <button
                type="button"
                className="text-xs text-red-500 underline"
                onClick={e => {
                  e.stopPropagation()
                  setImage(null)
                  setImageUrl("")
                  setImageCredit("")
                }}
              >
                Remove Image
              </button>
            </div>
          ) : (
            <div>
              <p className="text-muted-foreground mb-2">Drag & drop an image here, or <span className="text-primary underline">click to select</span></p>
              <p className="text-xs text-muted-foreground">Recommended: 1200x600px, JPG/PNG</p>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={e => {
              if (e.target.files && e.target.files[0]) {
                handleImageChange(e.target.files[0])
              }
            }}
          />
        </div>
        {/* Image Credit */}
        {imageUrl && (
          <div>
            <label className="block mb-1 font-medium">Image Credit (optional)</label>
            <input
              className="w-full border rounded p-2"
              placeholder="e.g. Photo by John Doe on Unsplash"
              value={imageCredit}
              onChange={e => setImageCredit(e.target.value)}
            />
          </div>
        )}
        {/* Title */}
        <div>
          <label className="block mb-1 font-medium">Title</label>
          <input
            className="w-full border rounded p-2"
            placeholder="Enter a catchy title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>
        {/* Subtitle */}
        <div>
          <label className="block mb-1 font-medium">Subtitle</label>
          <input
            className="w-full border rounded p-2"
            placeholder="Add a subtitle (optional)"
            value={subtitle}
            onChange={e => setSubtitle(e.target.value)}
          />
        </div>
        {/* Category */}
        <div>
          <label className="block mb-1 font-medium">Category</label>
          <div className="relative" ref={categoryDropdownRef}>
            <button
              type="button"
              className="w-full border rounded p-2 text-left bg-background"
              onClick={e => {
                e.preventDefault()
                setCategoryDropdownOpen(open => !open)
              }}
            >
              {categories.length === 0 ? "Select categories..." : categories.join(", ")}
            </button>
            {categoryDropdownOpen && (
              <div
                id="category-dropdown"
                className="absolute z-10 mt-1 w-full bg-white dark:bg-background border rounded shadow-lg"
              >
                {CATEGORY_OPTIONS.map(option => (
                  <label
                    key={option}
                    className="flex items-center px-4 py-2 cursor-pointer hover:bg-primary/10"
                  >
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={categories.includes(option)}
                      onChange={e => {
                        setCategories(prev =>
                          e.target.checked
                            ? [...prev, option]
                            : prev.filter(cat => cat !== option)
                        )
                      }}
                    />
                    {option}
                  </label>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {categories.map(cat => (
              <span key={cat} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                {cat}
              </span>
            ))}
          </div>
        </div>
        {/* Tags */}
        <div>
          <label className="block mb-1 font-medium">Tags</label>
          <div className="flex gap-2 mb-2">
            <input
              className="border rounded p-2 flex-1"
              placeholder="Add a tag and press Enter"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => {
                if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
                  e.preventDefault()
                  if (!tags.includes(tagInput.trim())) {
                    setTags([...tags, tagInput.trim()])
                  }
                  setTagInput("")
                }
              }}
            />
            <button
              type="button"
              className="bg-muted text-primary px-3 py-2 rounded border border-primary"
              onClick={() => {
                if (tagInput.trim() && !tags.includes(tagInput.trim())) {
                  setTags([...tags, tagInput.trim()])
                  setTagInput("")
                }
              }}
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, idx) => (
              <span key={tag} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-1">
                {tag}
                <button
                  type="button"
                  className="ml-1 text-xs"
                  onClick={() => setTags(tags.filter((_, i) => i !== idx))}
                  aria-label={`Remove tag ${tag}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
        {/* Content */}
        <div>
          <label className="block mb-1 font-medium">Content</label>
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            placeholder="Write your blog content here..."
            modules={{
              toolbar: [
                [{ header: [1, 2, 3, false] }],
                ["bold", "italic", "underline", "strike"],
                [{ list: "ordered" }, { list: "bullet" }],
                ["blockquote", "code-block"],
                ["link", "image"],
                ["clean"]
              ]
            }}
            className="bg-white dark:bg-background"
          />
        </div>
        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-primary text-white px-6 py-2 rounded font-semibold flex-1"
            disabled={saving || publishing}
          >
            {saving ? "Saving..." : blogStatus === "draft" ? "Save as Draft" : "Save Changes"}
          </button>
          {blogStatus === "draft" && (
            <button
              type="button"
              className="bg-green-600 text-white px-6 py-2 rounded font-semibold flex-1"
              disabled={publishing || saving}
              onClick={e => handleSubmit(e as any, "published")}
            >
              {publishing ? "Publishing..." : "Publish"}
            </button>
          )}
        </div>
      </form>
      {/* Live Preview */}
      <div className="flex-1 bg-muted/10 rounded-lg p-6 shadow min-h-[400px]">
        <div className="mb-4">
          <span className="text-xs text-muted-foreground uppercase">Preview</span>
        </div>
        {imageUrl && (
          <div className="mb-4">
            <img src={imageUrl} alt="Preview" className="max-h-48 rounded w-full object-cover" />
            {imageCredit && (
              <div className="text-xs text-muted-foreground mt-1 italic text-center">
                {imageCredit}
              </div>
            )}
          </div>
        )}
        <h2 className="text-2xl font-bold mb-2">{title || <span className="text-muted-foreground">Blog Title</span>}</h2>
        {subtitle && (
          <h3 className="text-lg text-muted-foreground mb-4">{subtitle}</h3>
        )}
        <div
          className="prose prose-slate dark:prose-invert max-w-none"
          style={{
            counterReset: "list-item"
          }}
          dangerouslySetInnerHTML={{
            __html: content || "<p class='text-muted-foreground'>Blog content preview...</p>"
          }}
        />
        <style jsx global>{`
          .prose ol {
            list-style-type: decimal !important;
            margin-left: 1.5em;
          }
          .prose ul {
            list-style-type: disc !important;
            margin-left: 1.5em;
          }
        `}</style>
      </div>
    </div>
  )
}
