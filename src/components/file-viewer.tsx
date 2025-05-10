import { FileIcon, Download, ExternalLink } from "lucide-react"
import { Button } from "./ui/button"
import { downloadFile, openFile, getCloudinaryUrl } from "@/lib/cloudinary-helper"
import { toast } from "sonner"

interface FileViewerProps {
  file: {
    name: string
    type: string
    url: string
    size: number
  }
}

export function FileViewer({ file }: FileViewerProps) {
  const isImage = file.type.startsWith('image/')
  const isPDF = file.type === 'application/pdf'
  const isViewable = isImage || isPDF

  const handleView = async () => {
    try {
      window.open(file.url, '_blank', 'noopener,noreferrer')
    } catch (error) {
      console.error('View error:', error)
      toast.error('Failed to open file')
    }
  }

  const handleDownload = async () => {
    try {
      if (isImage) {
        await downloadFile(file.url, file.name)
      } else {
        // For other files, direct download
        window.location.href = file.url
      }
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
          {isViewable && (
            <Button variant="outline" size="sm" onClick={handleView}>
              <ExternalLink className="h-4 w-4 mr-2" />
              View
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

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
