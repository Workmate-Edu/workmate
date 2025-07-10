'use client'

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import "react-quill/dist/quill.snow.css"
import { useSession } from "next-auth/react"
import { useToast } from "@/components/ui/use-toast"

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false })

const CATEGORY_OPTIONS = [
  "STEM",
  "Language",
  "Africa",
  "Global",
  "Company Update"
]

export default function BlogCreatePage() {
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [content, setContent] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageCredit, setImageCredit] = useState("")
  const [category, setCategory] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [isDrafting, setIsDrafting] = useState(false)
  const [categories, setCategories] = useState<string[]>([])
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const categoryDropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { data: session, status } = useSession();
  const { toast } = useToast()

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

  useEffect(() => {
    // Log all input data as they change
    console.log({
      title,
      subtitle,
      content,
      image,
      imageUrl,
      imageCredit,
      categories,
      tags
    })
  }, [title, subtitle, content, image, imageUrl, imageCredit, categories, tags])

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

  const validate = () => {
    const errs: { [key: string]: string } = {}
    if (!title.trim()) errs.title = "Title is required"
    if (!categories.length) errs.categories = "At least one category is required"
    if (!tags.length) errs.tags = "At least one tag is required"
    if (!content || content.trim() === "" || content === "<p><br></p>") errs.content = "Content is required"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent, status: "published" | "draft" = "published") => {
    e.preventDefault()
    if (!validate()) {
      setLoading(false)
      toast({
        variant: "destructive",
        description: "Please fill in all required fields before submitting."
      })
      return
    }
    setLoading(true)
    let uploadedImageUrl = null
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
      } else {
        toast({
          variant: "destructive",
          description: "Image upload failed. Please try again."
        })
        setLoading(false)
        return
      }
    }
    // Log data before submit
    console.log("Submitting blog post:", {
      title,
      subtitle,
      content,
      image: uploadedImageUrl,
      imageCredit,
      category: categories, // array
      tags,
      status
    })
    const res = await fetch("/api/blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        subtitle,
        content,
        image: uploadedImageUrl,
        imageCredit,
        category: categories, // array
        tags,
        status
      })
    })
    if (res.ok) {
      router.push("/blog/dashboard")
    } else {
      const err = await res.json().catch(() => ({}))
      toast({
        variant: "destructive",
        description: err?.error || "Failed to create blog post. Please try again."
      })
    }
    setLoading(false)
  }

  // Access control: Only admin or blogger can access
  if (status !== "loading" && (!session?.user || (!session.user.blogger && session.user.role !== "admin"))) {
    return (
      <div className="max-w-2xl mx-auto py-24 text-center text-lg text-muted-foreground">
        You do not have access to create blogs.
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto py-12">
      {/* Form */}
      <form
        onSubmit={e => handleSubmit(e, "published")}
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
                  setImageUrl(null)
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
          {errors.title && <div className="text-red-500 text-xs mt-1">{errors.title}</div>}
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
          {errors.categories && <div className="text-red-500 text-xs mt-1">{errors.categories}</div>}
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
          {errors.tags && <div className="text-red-500 text-xs mt-1">{errors.tags}</div>}
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
          {errors.content && <div className="text-red-500 text-xs mt-1">{errors.content}</div>}
        </div>
        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-primary text-white px-6 py-2 rounded font-semibold flex-1"
            disabled={loading}
          >
            {loading && !isDrafting ? "Creating..." : "Create Blog Post"}
          </button>
          <button
            type="button"
            className="bg-muted text-primary px-6 py-2 rounded font-semibold flex-1 border border-primary"
            disabled={loading}
            onClick={e => {
              setIsDrafting(true)
              handleSubmit(e as any, "draft")
                .finally(() => setIsDrafting(false))
            }}
          >
            {isDrafting ? "Saving..." : "Save as Draft"}
          </button>
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
