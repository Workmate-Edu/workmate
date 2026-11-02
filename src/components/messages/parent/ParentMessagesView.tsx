"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Paperclip, Send, Smile } from "lucide-react";
import { toast } from "sonner";
import EmojiPicker from "emoji-picker-react";
import { cn } from "@/lib/utils";
import { useSocketContext } from "@/contexts/socket-context";
import { MessageBubble } from "../shared/message-bubble";
import { LoadingDots } from "@/components/ui/loading-dots";

interface ParentMessagesViewProps {
  conversation: any;
  onSelectConversation: (conversation: any) => void;
  childContext?: {
    name: string;
    id: string;
  };
}

export function ParentMessagesView({ 
  conversation, 
  childContext 
}: ParentMessagesViewProps) {
  const { data: session } = useSession();
  const { socket, isConnected } = useSocketContext();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get teacher from conversation with null checks
  const teacher = conversation?.participants?.find(p => 
    p?.userId?.role === 'teacher' || p?.role === 'teacher'
  );

  const getTeacherName = () => {
    if (!teacher) return 'Teacher';
    return teacher.name || teacher.userId?.name || 'Teacher';
  };

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!conversation?._id) return;
      
      try {
        setLoading(true);
        const res = await fetch(`/api/conversations/${conversation._id}/messages`);
        if (!res.ok) throw new Error('Failed to fetch messages');
        const data = await res.json();
        setMessages(data || []);
        
        // Scroll to bottom after messages load
        setTimeout(() => {
          scrollRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [conversation?._id]);

  // Socket connection
  useEffect(() => {
    if (!socket || !conversation?._id) return;
    
    console.log('Parent joining conversation:', conversation._id);
    socket.emit('join_conversation', conversation._id);

    const handleNewMessage = (message: any) => {
      console.log('Parent received new message:', message);
      setMessages(prev => {
        // Check if message already exists
        const exists = prev.some(msg => msg._id === message._id);
        if (exists) return prev;
        
        const updatedMessages = [...prev, message];
        // Scroll to bottom after message is added
        setTimeout(() => {
          scrollRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
        return updatedMessages;
      });
    };

    socket.on('receive_message', handleNewMessage);
    
    return () => {
      console.log('Parent leaving conversation:', conversation._id);
      socket.off('receive_message', handleNewMessage);
      socket.emit('leave_conversation', conversation._id);
    };
  }, [socket, conversation?._id]);

  // Message handlers
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !conversation?._id || sending || !socket) return;

    try {
      setSending(true);
      
      // Optimistic local feedback; broadcast only after persistence.
      const tempMessage = {
        _id: Date.now().toString(),
        content: message,
        senderId: session?.user?.id,
        createdAt: new Date().toISOString()
      };

      // Add message to state immediately
      setMessages(prev => [...prev, tempMessage]);
      setMessage(""); // Clear input right away

      // Save to database before broadcasting
      const res = await fetch(`/api/conversations/${conversation._id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message })
      });

      if (!res.ok) throw new Error('Failed to send message');
      const savedMessage = await res.json();
      setMessages(prev => prev.map(msg => msg._id === tempMessage._id ? savedMessage : msg));
      socket.emit('send_message', { conversationId: conversation._id, messageId: savedMessage._id });
      
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
      // Remove temp message if save failed
      setMessages(prev => prev.filter(msg => msg._id !== Date.now().toString()));
    } finally {
      setSending(false);
    }
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    try {
      const res = await fetch(`/api/conversations/${conversation._id}/messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent })
      });

      if (!res.ok) throw new Error('Failed to edit message');
      
      const updatedMessage = await res.json();
      setMessages(prev => 
        prev.map(msg => msg._id === messageId ? updatedMessage : msg)
      );
    } catch (error) {
      toast.error('Failed to edit message');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const res = await fetch(`/api/conversations/${conversation._id}/messages/${messageId}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Failed to delete message');
      
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
      toast.success('Message deleted');
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };

  if (!conversation) {
    return (
      <Card className="h-full flex items-center justify-center text-muted-foreground">
        <p>Select a conversation to start messaging</p>
      </Card>
    );
  }

  return (
    <Card className="h-[calc(100vh-12rem)] flex flex-col">
      {/* Teacher Info Header */}
      <div className="p-4 border-b">
        <h2 className="font-semibold">{getTeacherName()}</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Teacher</span>
          {childContext && (
            <>
              <span>•</span>
              <span>Re: {childContext.name}</span>
            </>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea 
        className="flex-1 px-4"
        ref={scrollAreaRef}
      >
        <div className="space-y-4 py-4 min-h-[calc(100vh-16rem)]">
          {messages.map((msg) => (
            <MessageBubble
              key={msg._id}
              message={msg}
              isCurrentUser={msg.senderId === session?.user?.id}
              onEditMessage={handleEditMessage}
              onDeleteMessage={handleDeleteMessage}
            />
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t bg-background">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <div className="flex items-center gap-2 flex-1 rounded-lg border bg-background p-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={sending}
                >
                  <Smile className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent side="top" className="w-80 p-0">
                <EmojiPicker 
                  onEmojiClick={(data) => setMessage(prev => prev + data.emoji)}
                  width="100%" 
                />
              </PopoverContent>
            </Popover>

            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-transparent focus:outline-none"
              disabled={sending}
            />
          </div>

          <Button 
            type="submit" 
            size="icon" 
            disabled={!message.trim() || sending || !isConnected}
          >
            {sending ? (
              <LoadingDots className="px-1 py-3" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </Card>
  );
}
