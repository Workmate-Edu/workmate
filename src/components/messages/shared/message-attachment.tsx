import { FileText, ImageIcon } from "lucide-react";

interface AttachmentProps {
  attachment: {
    url: string;
    type: string;
    name: string;
  };
}

export function MessageAttachment({ attachment }: AttachmentProps) {
  if (attachment.type.startsWith('image/')) {
    return (
      <div className="mt-2 group relative">
        <div className="max-w-[200px] max-h-[200px] overflow-hidden rounded-lg cursor-pointer">
          <img 
            src={attachment.url} 
            alt={attachment.name}
            className="w-full h-full object-cover hover:opacity-90 transition-opacity"
            onClick={() => window.open(attachment.url, '_blank')}
          />
        </div>
        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          <ImageIcon className="h-3 w-3" />
          {attachment.name}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2">
      <a 
        href={attachment.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-sm hover:underline group p-2 bg-muted rounded-md"
      >
        <FileText className="h-4 w-4 group-hover:text-primary transition-colors" />
        <div className="flex flex-col">
          <span className="break-all">{attachment.name}</span>
          <span className="text-xs text-muted-foreground">Click to download</span>
        </div>
      </a>
    </div>
  );
}
