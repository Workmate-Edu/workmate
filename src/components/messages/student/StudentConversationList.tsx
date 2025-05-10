"use client";

import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ConversationItem } from "../shared/ConversationItem";
import { useSocketContext } from "@/contexts/socket-context";
import { Skeleton } from "@/components/ui/skeleton";

interface Participant {
  userId?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  role: string;
  name: string;
  email: string;
  _id: string;
}

interface Conversation {
  _id: string;
  participants: Participant[];
  lastMessage?: {
    content: string;
    senderId: string;
    createdAt: string;
  };
  unreadCount: number;
}

interface ConversationWithOther extends Conversation {
  otherParticipant?: {
    name: string;
    role: string;
    email: string;
  };
}

interface StudentConversationListProps {
  onSelectConversation: (conv: ConversationWithOther) => void;
  activeConversation: ConversationWithOther | null;
}

export function StudentConversationList({
  onSelectConversation,
  activeConversation
}: StudentConversationListProps) {
  const [conversations, setConversations] = useState<ConversationWithOther[]>([]);
  const [loading, setLoading] = useState(true);
  const { socket, isConnected } = useSocketContext();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/conversations?role=teacher');
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

  useEffect(() => {
    if (!socket) return;

    const handleConversationUpdate = (data: any) => {
      setConversations(prev => prev.map(conv => 
        conv._id === data.conversationId ? { ...conv, ...data } : conv
      ));
    };

    socket.on('conversation_update', handleConversationUpdate);

    return () => {
      socket.off('conversation_update', handleConversationUpdate);
    };
  }, [socket]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-[120px]" />
              <Skeleton className="h-3 w-[180px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!conversations.length) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>No conversations yet</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-12rem)]">
      <div className="space-y-2">
        {conversations.map((conversation) => (
          <ConversationItem
            key={conversation._id}
            name={conversation.otherParticipant?.name || "Unknown"}
            role={conversation.otherParticipant?.role}
            lastMessage={conversation.lastMessage?.content}
            unreadCount={conversation.unreadCount || 0}
            active={activeConversation?._id === conversation._id}
            onClick={() => onSelectConversation(conversation)}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
