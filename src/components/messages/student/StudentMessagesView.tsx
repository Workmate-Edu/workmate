"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Paperclip, Send, Smile, Loader2, FileText, Image as ImageIcon, Check, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState, useEffect, useRef } from "react";
import EmojiPicker from "emoji-picker-react";
import { useSocket } from "@/hooks/use-socket";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { LoadingDots } from "@/components/ui/loading-dots";
import { Skeleton } from "@/components/ui/skeleton";
import { uploadMessageFile } from "@/lib/message-upload";
import { MessageActions } from "@/components/messages/message-actions";
import { decrypt } from "@/lib/encryption";
import { useSocketContext } from "@/contexts/socket-context";
import { MessageBubble } from "../shared/message-bubble";
import mongoose from "mongoose";

interface Message {
  _id: string;
  conversationId: string;
  content: string;
  senderId: string;
  senderName: string;
  createdAt: string;
  updatedAt: string;
  attachments?: MessageAttachment[];
}

interface MessageAttachment {
  url: string;
  name: string;
  type: string;
}

interface PusherMessage {
  conversation: string;
  message: Message;
}

interface StudentMessagesViewProps {
  conversation: any;
  onSelectConversation: (conversation: any) => void;
}

export function StudentMessagesView({ conversation }: StudentMessagesViewProps) {
  const { data: session } = useSession();
  // const { subscribe, unsubscribe, isConnected } = usePusher();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  // const socket = useSocket();
  const { socket, isConnected } = useSocketContext();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  // Get teacher from conversation
  const teacher = conversation?.participants.find(p => p.role === 'teacher');

  // Update fetch messages effect
  useEffect(() => {
    const fetchMessages = async () => {
      if (!conversation?._id) return;
      
      try {
        setLoading(true);
        const res = await fetch(`/api/conversations/${conversation._id}/messages`);
        if (!res.ok) throw new Error('Failed to fetch messages');
        const data = await res.json();
        // Update to handle the actual messages array from the response
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


  // Mark messages as read when conversation is opened or new messages arrive
  useEffect(() => {
    if (!conversation?._id) return;

    const markAsRead = async () => {
      try {
        await fetch(`/api/conversations/${conversation._id}/read`, {
          method: 'POST'
        });
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    };

    markAsRead();
  }, [conversation?._id, messages]);


  // Add socket listener for real-time updates
  useEffect(() => {
    if (!socket || !conversation?._id) return;
  
    console.log('Joining conversation:', conversation._id);
    
    // Just pass the conversationId string directly
    socket.emit('join_conversation', conversation._id);

    const handleNewMessage = (newMessage: Message) => {
      if (newMessage.conversationId === conversation._id) {
        addMessageToState(newMessage);
      }
    };

    socket.on('receive_message', handleNewMessage);
  
    return () => {
      socket.off('receive_message', handleNewMessage);
      socket.emit('leave_conversation', conversation._id);
    };
  }, [socket, conversation?._id]);
  

  // Subscribe to Pusher events
  // useEffect(() => {
  //   if (!session?.user?.id || !isConnected || !conversation?._id) return;

  //   const channelName = `private-user-${session.user.id}`;
  //   const channel = subscribe(channelName);
    
  //   if (channel) {
  //     // Handle new messages
  //     channel.bind('new-message', (data: PusherMessage) => {
  //       if (data.conversation === conversation._id) {
  //         addMessageToState(data.message);
  //       }
  //     });

  //     // Handle conversation updates
  //     channel.bind('conversation-update', (data: any) => {
  //       if (data.conversationId === conversation._id) {
  //         // Update last message if needed
  //       }
  //     });

  //     // Handle message status updates
  //     channel.bind('message-status', (data: any) => {
  //       if (data.conversationId === conversation._id) {
  //         setMessages(prev => 
  //           prev.map(msg => 
  //             msg._id === data.messageId 
  //               ? { ...msg, status: data.status }
  //               : msg
  //           )
  //         );
  //       }
  //     });
  //   }

  //   return () => {
  //     if (channel) {
  //       channel.unbind_all();
  //       unsubscribe(channelName);
  //     }
  //   };
  // }, [session?.user?.id, conversation?._id, isConnected]);

  const addMessageToState = (newMessage: Message) => {
    setMessages(prev => {
      // Check if message already exists
      const exists = prev.some(msg => msg._id === newMessage._id);
      if (exists) return prev;
      return [...prev, newMessage];
    });
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !conversation?._id || sending || !socket) return;

    try {
      setSending(true);
      
      // Generate a proper MongoDB ObjectId for temp message
      const tempId = new mongoose.Types.ObjectId().toString();
      
      // Create temp message with proper ID format
      const tempMessage = {
        _id: tempId,
        content: message,
        senderId: session?.user?.id,
        conversationId: conversation._id,
        createdAt: new Date().toISOString()
      };

      setMessages(prev => [...prev, tempMessage]);
      setMessage("");

      // Send via socket
      socket.emit('send_message', {
        conversationId: conversation._id,
        message: tempMessage
      });

      // Save to database
      const res = await fetch(`/api/conversations/${conversation._id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: message,
          tempId // Send tempId to match messages
        })
      });

      if (!res.ok) throw new Error('Failed to send message');

      const savedMessage = await res.json();
      
      // Replace temp message with saved one
      setMessages(prev => 
        prev.map(msg => msg._id === tempId ? savedMessage : msg)
      );

    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
      // Remove temp message if failed
      setMessages(prev => prev.filter(msg => msg._id !== tempId));
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (!socket || !conversation?._id) return;
    
    console.log('Student joining conversation:', conversation._id);
    socket.emit('join_conversation', conversation._id);

    const handleNewMessage = (message: any) => {
      console.log('Student received new message:', message);
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
      console.log('Student leaving conversation:', conversation._id);
      socket.off('receive_message', handleNewMessage);
      socket.emit('leave_conversation', conversation._id);
    };
  }, [socket, conversation?._id]);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast.error('Only images and PDF files are allowed');
      return;
    }

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size should be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      const result = await uploadMessageFile(file);
      
      if (result?.url) {
        const res = await fetch(`/api/conversations/${conversation._id}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `Sent a file: ${file.name}`,
            attachments: [{
              url: result.url,
              type: file.type,
              name: file.name
            }]
          })
        });

        if (!res.ok) throw new Error('Failed to send file message');
        const newMessage = await res.json();
        addMessageToState(newMessage);
      }
    } catch (error) {
      toast.error('Failed to upload file');
      console.error('File upload error:', error);
    } finally {
      setUploading(false);
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
      setEditingMessage(null);
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
      
      // Remove the message from state instead of updating it
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
      toast.success('Message deleted');
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };

  // Add auto scroll for new messages
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const renderAttachment = (attachment: MessageAttachment) => {
    if (attachment.type.startsWith('image/')) {
      return (
        <div className="mt-2 group relative">
          <img 
            src={attachment.url} 
            alt={attachment.name}
            className="max-w-[300px] rounded-md hover:opacity-95 transition-opacity cursor-pointer"
            onClick={() => window.open(attachment.url, '_blank')}
          />
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
  };

  const renderEditForm = (msg: any) => (
    <div className="max-w-[80%] space-y-2">
      <div className="flex flex-col gap-2 rounded-lg bg-background p-2 shadow-sm border">
        <input
          type="text"
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="w-full px-3 py-2 rounded-md bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-all"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Escape') setEditingMessage(null);
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleEditMessage(msg._id, editContent);
            }
          }}
        />
        <div className="flex justify-end items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 px-3 text-muted-foreground hover:text-foreground"
            onClick={() => setEditingMessage(null)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            variant="default"
            className="h-8 px-3"
            onClick={() => handleEditMessage(msg._id, editContent)}
            disabled={!editContent.trim() || editContent === msg.content}
          >
            Save changes
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground pl-2">
        Press Esc to cancel • Enter to save
      </p>
    </div>
  );

  const handleStartEdit = (msg: any) => {
    // Attempt to decrypt if the message is encrypted
    let originalContent = msg.content;
    if (originalContent.includes(':')) {
      try {
        originalContent = decrypt(originalContent);
      } catch (error) {
        console.error('Failed to decrypt message for editing:', error);
      }
    }
    setEditingMessage(msg._id);
    setEditContent(originalContent);
  };

  const decryptMessage = (content: string) => {
    try {
      return content.includes(':') ? decrypt(content) : content;
    } catch (error) {
      console.error('Failed to decrypt message:', error);
      return content;
    }
  };

  const renderMessage = (msg: any) => (
    <div className="group flex items-start gap-2">
      <div className={cn(
        "relative inline-block min-w-[200px] max-w-[85%] rounded-lg p-3",
        msg.senderId === session?.user?.id 
          ? "bg-primary text-primary-foreground ml-auto" 
          : "bg-muted"
      )}>
        {editingMessage === msg._id ? (
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-2 rounded border bg-background text-foreground"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setEditingMessage(null);
                }
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleEditMessage(msg._id, editContent);
                }
              }}
            />
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditingMessage(null)}
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                onClick={() => handleEditMessage(msg._id, editContent)}
                disabled={!editContent.trim() || editContent === msg.content}
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="pr-6">
            {(!msg.attachments?.length || msg.content !== `Shared ${msg.attachments.length} file(s)`) && (
              <div className="break-words whitespace-pre-wrap">
                <p className="text-sm">{msg.content}</p>
              </div>
            )}
            
            {msg.attachments?.map((attachment: MessageAttachment, index: number) => (
              <div key={index} className="mt-2 w-full">
                {renderAttachment(attachment)}
              </div>
            ))}
            
            <p className="text-xs opacity-70 mt-2">
              {new Date(msg.createdAt).toLocaleTimeString()}
            </p>
          </div>
        )}

        <MessageActions
          messageId={msg._id}
          conversationId={conversation._id}
          isSender={msg.senderId === session?.user?.id}
          hasAttachments={!!msg.attachments?.length}
          onEdit={() => handleStartEdit(msg)}
          onDelete={() => handleDeleteMessage(msg._id)}
        />
      </div>
    </div>
  );

  const MessageSkeleton = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className={cn("flex items-start gap-2", i % 2 === 0 ? "flex-row-reverse" : "flex-row")}>
          <div className={cn(
            "max-w-[80%] rounded-lg p-3",
            i % 2 === 0 ? "bg-primary/20" : "bg-muted"
          )}>
            <Skeleton className="h-4 w-[200px] mb-2" />
            <Skeleton className="h-3 w-[100px]" />
          </div>
        </div>
      ))}
    </div>
  );

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
        <h2 className="font-semibold">{teacher?.name}</h2>
        <p className="text-sm text-muted-foreground">Teacher</p>
      </div>

      {/* Messages Area */}
      <ScrollArea 
        className="flex-1 px-4"
        ref={scrollAreaRef}
      >
        {loading ? (
          <div className="py-4">
            <MessageSkeleton />
          </div>
        ) : (
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
        )}
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
              disabled={sending || uploading}
            />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={sending || uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? (
                <LoadingDots className="px-1 py-3" />
              ) : (
                <Paperclip className="h-5 w-5" />
              )}
            </Button>
            <input 
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".pdf,image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
                e.target.value = '';
              }}
            />
          </div>

          <Button 
            type="submit" 
            size="icon" 
            disabled={!message.trim() || sending || uploading || !isConnected}
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
