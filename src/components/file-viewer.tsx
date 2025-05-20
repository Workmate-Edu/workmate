import { FileIcon, Download, ExternalLink } from "lucide-react"
import { Button } from "./ui/button"
import { toast } from "sonner"

interface FileViewerProps {
  file: {
    name: string
    type: string
    url: string
    size: number
    publicId?: string
  }
}

export function FileViewer({ file }: FileViewerProps) {
  const isImage = file.type.startsWith('image/')
  const isPDF = file.type.includes('pdf')

  const handleView = () => {
    try {
      // For PDFs, use PDF viewer
      if (isPDF) {
        const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(file.url)}&embedded=true`
        window.open(viewerUrl, '_blank', 'noopener,noreferrer')
      } else {
        // For other files, open directly
        window.open(file.url, '_blank', 'noopener,noreferrer')
      }
    } catch (error) {
      console.error('View error:', error)
      toast.error('Failed to open file')
    }
  }

  const handleDownload = async () => {
    try {
      const a = document.createElement('a')
      a.href = file.url
      a.download = file.name // Use original filename
      a.target = '_blank'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download file')
    }
  }

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileIcon className="h-4 w-4" />
          <span className="font-medium">{file.name}</span>
          <span className="text-xs text-muted-foreground">
            ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleView}>
            <ExternalLink className="h-4 w-4 mr-2" />
            View
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* PDF Preview */}
      {isPDF && (
        <div className="mt-4 h-[500px] border rounded">
          <iframe
            src={`https://docs.google.com/viewer?url=${encodeURIComponent(file.url)}&embedded=true`}
            className="w-full h-full"
            frameBorder="0"
            title="PDF Preview"
          />
        </div>
      )}

      {/* Image Preview */}
      {isImage && (
        <div className="mt-4">
          <img
            src={file.url}
            alt={file.name}
            className="max-w-full h-auto rounded"
            loading="lazy"
          />
        </div>
      )}
    </div>
  )
}
