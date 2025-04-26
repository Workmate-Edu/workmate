"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSocketContext } from "@/contexts/socket-context"; 
import { ConversationItem } from "../shared/ConversationItem";

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
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<ConversationWithOther[]>([]);
  const [loading, setLoading] = useState(true);
  const { socket, isConnected } = useSocketContext(); // ✅ Updated usage

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch('/api/conversations?role=teacher');
        if (!res.ok) throw new Error('Failed to fetch conversations');
        const data = await res.json();
        setConversations(data);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

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

  const getOtherParticipant = (conversation: ConversationWithOther) => {
    return conversation.participants.find(p => 
      p.role === 'teacher' || (p.userId?.id !== session?.user?.id)
    );
  };

  if (loading) {
    return <div className="flex justify-center py-4">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
    </div>;
  }

  return (
    <div className="space-y-2">
      {!isConnected && (
        <div className="text-center text-xs text-muted-foreground">
          Connecting to server...
        </div>
      )}

      {conversations.map((conv) => (
        <ConversationItem
          key={conv._id}
          name={conv.otherParticipant?.name || 'Unknown'}
          lastMessage={conv.lastMessage?.content}
          unreadCount={conv.unreadCount || 0}
          active={activeConversation?._id === conv._id}
          role={conv.otherParticipant?.role === 'teacher' ? 'Teacher' : undefined}
          onClick={() => onSelectConversation(conv)}
        />
      ))}

      {conversations.length === 0 && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          No conversations yet
        </div>
      )}
    </div>
  );
}
