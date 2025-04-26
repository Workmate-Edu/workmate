"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { useSocketContext } from "@/contexts/socket-context"; // ✅ Updated import

interface Conversation {
  _id: string;
  lastMessage?: {
    content: string;
    senderId: string;
    createdAt: string;
  };
  unreadCount: number;
  otherParticipant: {
    name: string;
    role: string;
    email: string;
  };
}

interface ConversationWithOther extends Conversation {
  otherParticipant?: {
    name: string;
    role: string;
    email: string;
  };
}

export function TeacherConversationList({ 
  onSelectConversation, 
  activeConversation,
  searchQuery = ""
}: {
  onSelectConversation: (conv: ConversationWithOther) => void;
  activeConversation: ConversationWithOther | null;
  searchQuery?: string;
  role?: 'student' | 'parent';
}) {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<ConversationWithOther[]>([]);
  const [loading, setLoading] = useState(true);
  const { socket, isConnected } = useSocketContext(); // ✅ Updated usage

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/conversations/all');
        if (!res.ok) throw new Error('Failed to fetch conversations');
        const data = await res.json();
        console.log('Fetched conversations:', data); // Debug log
        setConversations(data);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [session?.user?.id]);

  useEffect(() => {
    if (!session?.user?.id || !socket) return;

    
    const handleConversationUpdate = (data: {
      conversation?: any;
      action: string;
      messageId?: string;
    }) => {
      if (!data.conversation || !data.conversation._id) {
        console.warn("⚠️ Received malformed conversation update:", data);
        return;
      }
    
      setConversations(prev =>
        prev.map(conv =>
          conv._id === data.conversation._id
            ? {
                ...conv,
                ...data.conversation,
                lastMessage: data.conversation.lastMessage || {
                  content: 'No messages',
                  createdAt: new Date().toISOString(),
                },
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
              {conv.otherParticipant?.name?.[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">
              {conv.otherParticipant?.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {conv.otherParticipant?.role === 'parent' ? 'Parent' : 'Student'}
            </p>
            {conv.lastMessage && (
              <p className="text-sm text-muted-foreground truncate">
                {conv.lastMessage.content}
              </p>
            )}
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
          {searchQuery ? 'No matching students' : 'No conversations yet'}
        </div>
      )}
    </div>
  );
}
