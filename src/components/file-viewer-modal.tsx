import { Dialog, DialogContent } from "@/components/ui/dialog"
import { FileViewer } from "./file-viewer"

interface FileViewerModalProps {
  isOpen: boolean
  onClose: () => void
  file: {
    name: string
    type: string
    url: string
    size: number
  }
}

export function FileViewerModal({ isOpen, onClose, file }: FileViewerModalProps) {
  const isImage = file.type.startsWith('image/')
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <div className="flex-1 overflow-auto">
          {isImage ? (
            <img
              src={file.url}
              alt={file.name}
              className="w-full h-auto object-contain"
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <FileViewer file={file} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
