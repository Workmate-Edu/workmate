import Link from "next/link"
import { Pencil, Trash2, Eye } from "lucide-react"
import { useRouter } from "next/navigation"

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

interface BlogCardProps {
  blog: any
  href?: string
  showView?: boolean
  showEdit?: boolean
  showDelete?: boolean
  onViewClick?: () => void
  onEditClick?: () => void
  onDeleteClick?: () => void
  showReadMore?: boolean
}

export function BlogCard({
  blog,
  href,
  showView,
  showEdit,
  showDelete,
  onViewClick,
  onEditClick,
  onDeleteClick,
  showReadMore
}: BlogCardProps) {
  const router = useRouter();

  // Fallbacks for edit/delete/view: always provide handlers if not passed
  const handleView = () => {
    if (onViewClick) onViewClick();
    else if (href) router.push(href);
  };
  const handleEdit = () => {
    if (onEditClick) onEditClick();
    else router.push(`/blog/edit/${blog.slug}`);
  };
  const handleDelete = () => {
    if (onDeleteClick) onDeleteClick();
    // else: do nothing, parent should provide handler for delete modal
  };

  return (
    <div
      className="rounded-lg shadow bg-white dark:bg-background overflow-hidden flex flex-col h-full relative group"
      tabIndex={0}
      role="article"
      onClick={e => {
        if (href) router.push(href)
      }}
    >
      <div className="p-5 flex flex-col h-full">
        {/* Category/tags */}
        {(blog.category || (blog.tags && blog.tags.length > 0)) && (
          <div className="mb-2 flex flex-wrap gap-2">
            {Array.isArray(blog.category)
              ? blog.category.map((cat, idx) => (
                  <span key={cat} className={`px-3 py-1 rounded-full text-xs font-semibold ${getTagColor(cat, idx)}`}>
                    {cat}
                  </span>
                ))
              : blog.category && (
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTagColor(blog.category, 0)}`}>
                    {blog.category}
                  </span>
                )}
            {blog.tags && blog.tags.map((tag, tIdx) => (
              <span
                key={tag}
                className={`px-3 py-1 rounded-full text-xs font-semibold ${getTagColor(tag, tIdx)}`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <h2 className="text-xl font-bold mb-1 line-clamp-2">{blog.title}</h2>
        {blog.subtitle && (
          <div className="text-muted-foreground text-base mb-2 line-clamp-1">{blog.subtitle}</div>
        )}
        <div className="text-sm text-muted-foreground mb-3 line-clamp-3 flex-1">
          {typeof blog.content === "string"
            ? blog.content.replace(/<[^>]+>/g, '').slice(0, 120) + (blog.content.length > 120 ? "..." : "")
            : ""}
        </div>
        <div className="flex items-center justify-between mt-auto">
          <div className="text-xs text-muted-foreground">{new Date(blog.createdAt).toLocaleDateString()}</div>
          <div className="flex gap-2 items-center">
            {showReadMore && (
              <Link
                href={`/blog/${blog.slug}`}
                className="text-primary hover:underline text-xs font-medium"
                title="Read more"
                target="_blank"
                rel="noopener noreferrer"
              >
                Read more
              </Link>
            )}
            {showView && (
              <button
                type="button"
                className="hover:bg-primary/10 rounded-full p-1"
                title="View"
                onClick={e => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleView();
                }}
              >
                <Eye className="w-5 h-5 text-primary" />
              </button>
            )}
            {showEdit && (
              <button
                type="button"
                className="hover:bg-blue-100 rounded-full p-1"
                title="Edit"
                onClick={e => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleEdit();
                }}
              >
                <Pencil className="w-5 h-5 text-blue-600" />
              </button>
            )}
            {showDelete && (
              <button
                type="button"
                className="hover:bg-red-100 rounded-full p-1"
                title="Delete"
                onClick={e => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleDelete();
                }}
              >
                <Trash2 className="w-5 h-5 text-red-600" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
