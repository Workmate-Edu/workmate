"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { useSocketContext } from "@/contexts/socket-context";

interface AdminConversationListProps {
  onSelectConversation: (conv: any) => void;
  activeConversation: any;
  searchQuery?: string;
}

export function AdminConversationList({
  onSelectConversation,
  activeConversation,
  searchQuery = ""
}: AdminConversationListProps) {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket, isConnected } = useSocketContext();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        // Note: Using role=teacher to fetch teacher conversations
        const res = await fetch('/api/conversations?role=teacher&type=admin');
        if (!res.ok) throw new Error('Failed to fetch conversations');
        const data = await res.json();
        setConversations(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  // ...reuse socket handlers from TeacherConversationList...

  const filteredConversations = conversations.filter(conv =>
    conv.otherParticipant?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {!isConnected && (
        <div className="text-center text-xs text-muted-foreground">
          Connecting to server...
        </div>
      )}

      {filteredConversations.map((conv) => (
        <button
          key={conv._id}
          onClick={() => onSelectConversation(conv)}
          className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted text-left
            ${activeConversation?._id === conv._id ? 'bg-muted' : ''}`}
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-lg font-semibold">
              {conv.otherParticipant?.name[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">
              {conv.otherParticipant?.name}
            </p>
            <p className="text-sm text-muted-foreground">Teacher</p>
          </div>
          {conv.unreadCount > 0 && (
            <div className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {conv.unreadCount}
            </div>
          )}
        </button>
      ))}

      {filteredConversations.length === 0 && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          {searchQuery ? 'No matching teachers' : 'No conversations yet'}
        </div>
      )}
    </div>
  );
}
