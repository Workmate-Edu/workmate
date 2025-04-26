"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { useSocketContext } from "@/contexts/socket-context";

interface ParentConversationListProps {
  onSelectConversation: (conv: any) => void;
  activeConversation: any;
  childId?: string;
  searchQuery?: string;
}

export function ParentConversationList({
  onSelectConversation,
  activeConversation,
  childId,
  searchQuery = ""
}: ParentConversationListProps) {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket, isConnected } = useSocketContext();

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const url = childId 
          ? `/api/conversations?role=teacher&childId=${childId}`
          : '/api/conversations?role=teacher';
        
        const res = await fetch(url);
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
  }, [childId]);

  // Socket updates
  useEffect(() => {
    if (!session?.user?.id || !socket) return;

    const handleConversationUpdate = (data: {
      conversation?: any;
      action: string;
      messageId?: string;
    }) => {
      if (!data.conversation?._id) {
        console.warn("⚠️ Invalid conversation update:", data);
        return;
      }

      setConversations(prev =>
        prev.map(conv =>
          conv._id === data.conversation._id
            ? {
                ...conv,
                ...data.conversation,
                lastMessage: data.conversation.lastMessage || conv.lastMessage
              }
            : conv
        )
      );
    };

    socket.on('conversation_update', handleConversationUpdate);

    return () => {
      socket.off('conversation_update', handleConversationUpdate);
    };
  }, [session?.user?.id, socket]);

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

      {/* Conversations List */}
      {conversations.map((conv: any) => (
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
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>{conv.childName}</span>
              {conv.lastMessage && (
                <>
                  <span>•</span>
                  <span className="truncate">{conv.lastMessage.content}</span>
                </>
              )}
            </div>
          </div>
          {conv.unreadCount > 0 && (
            <div className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {conv.unreadCount}
            </div>
          )}
        </button>
      ))}

      {conversations.length === 0 && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          No conversations yet
        </div>
      )}
    </div>
  );
}
