"use client";

import { cn } from "@/lib/utils";

interface ConversationItemProps {
  name: string;
  lastMessage?: string;
  unreadCount: number;
  active: boolean;
  role?: string;
  onClick: () => void;
}

export function ConversationItem({
  name,
  lastMessage,
  unreadCount,
  active,
  role,
  onClick
}: ConversationItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted text-left relative",
        active && "bg-muted"
      )}
    >
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
        <span className="text-lg font-semibold">{name[0]}</span>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="font-medium truncate">{name}</p>
          {unreadCount > 0 && (
            <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-1 ml-2">
              {unreadCount}
            </span>
          )}
        </div>
        {role && (
          <p className="text-xs text-muted-foreground">{role}</p>
        )}
        {lastMessage && (
          <p className="text-sm text-muted-foreground truncate">{lastMessage}</p>
        )}
      </div>
    </button>
  );
}
