import { Edit2, Trash2, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface MessageActionsProps {
  messageId: string;
  conversationId: string;
  isSender: boolean;
  hasAttachments?: boolean;
  isTextMessage?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function MessageActions({
  messageId,
  conversationId,
  isSender,
  hasAttachments = false,
  isTextMessage = true,
  onEdit,
  onDelete
}: MessageActionsProps) {
  // Only show actions if user is sender
  if (!isSender) return null;

  return (
    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0 hover:bg-black/10 dark:hover:bg-white/10"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[140px]">
          {/* Only show edit option for text messages without attachments */}
          {isTextMessage && !hasAttachments && (
            <DropdownMenuItem onClick={onEdit} className="gap-2 cursor-pointer">
              <Edit2 className="h-4 w-4" />
              Edit
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              onDelete();
            }}
            className="text-destructive gap-2 cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
