import { cn } from "@/lib/utils";

export function TypingIndicator() {
  return (
    <div className="flex items-center space-x-2 p-2">
      <div className="flex space-x-1">
        <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/30" style={{ animationDelay: '0ms' }} />
        <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/30" style={{ animationDelay: '150ms' }} />
        <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/30" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}
