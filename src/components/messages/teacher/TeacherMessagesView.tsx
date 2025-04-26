"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Paperclip, Send, Smile, Loader2, X, Check, FileText, Image as ImageIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState, useEffect, useRef } from "react";
import EmojiPicker from "emoji-picker-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { LoadingDots } from "@/components/ui/loading-dots";
import { uploadMessageFile } from "@/lib/message-upload";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageActions } from "@/components/messages/message-actions";
import { useSocketContext } from "@/contexts/socket-context";
import { MessageBubble } from "../shared/message-bubble";

interface TeacherMessagesViewProps {
  conversation: any;
  onSelectConversation: (conversation: any) => void;
}

interface Message {
  _id: string;
  content: string;
  senderId: string;
  createdAt: string;
  attachments?: MessageAttachment[];
}

interface PusherMessage {
  conversation: string;
  message: Message;
}

interface MessageAttachment {
  url: string;
  type: string;
  name: string;
}

export function TeacherMessagesView({ conversation }: TeacherMessagesViewProps) {
  const { data: session } = useSession();
//   const { subscribe, unsubscribe } = usePusher();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
//   const socket = useSocket();
  const { socket, isConnected } = useSocketContext();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
//   const { isConnected } = usePusher();

  const addMessageToState = (newMessage: Message) => {
    console.log('Adding message to state:', newMessage);
    setMessages(prev => {
      // Check if message already exists
      const exists = prev.some(msg => msg._id === newMessage._id);
      if (exists) {
        console.log('Message already exists, skipping');
        return prev;
      }
      
      const updatedMessages = [...prev, newMessage];
      
      // Scroll to bottom after message is added
      requestAnimationFrame(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      });
      
      return updatedMessages;
    });
  };

  useEffect(() => {
    console.log("Socket connected status:", isConnected);
  }, [isConnected]);

  const getParticipantInfo = () => {
    if (!conversation?.participants) return null;
    return {
      student: conversation.participants.find(p => p?.role === 'student'),
      name: conversation.participants.find(p => p?.role === 'student')?.name || 'Student'
    };
  };

  // Get student info with null check
  const studentInfo = getParticipantInfo();

  const fetchMessages = async (pageNum: number) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/conversations/${conversation._id}/messages?page=${pageNum}`);
      if (!res.ok) throw new Error('Failed to fetch messages');
      const data = await res.json();
      
      if (pageNum === 1) {
        setMessages(data);
      } else {
        setMessages(prev => [...data, ...prev]);
      }
      
      setHasMore(data.length === 20); // Assuming 20 messages per page
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    if (!session?.user?.id || !conversation?._id || !socket) return;

    console.log('Setting up message handlers for conversation:', conversation._id);

    // Just pass the conversationId string directly
    socket.emit('join_conversation', conversation._id);

    // Handle new messages
    const handleNewMessage = (message: any) => {
      console.log('Received new message:', message);
      addMessageToState(message);
    };

    socket.on('receive_message', handleNewMessage);

    return () => {
      socket.off('receive_message', handleNewMessage);
      socket.emit('leave_conversation', conversation._id);
    };
  }, [session?.user?.id, conversation?._id, socket]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !conversation?._id || sending || !socket) return;

    try {
      setSending(true);
      
      // First emit through socket for instant delivery
      const tempId = Date.now().toString();
      const messageData = {
        _id: tempId,
        content: message,
        senderId: session?.user?.id,
        createdAt: new Date().toISOString()
      };

      // Add message to state immediately
      addMessageToState(messageData);

      // Emit to socket
      socket.emit('send_message', {
        conversationId: conversation._id,
        message: messageData
      });

      // Then save to database
      const res = await fetch(`/api/conversations/${conversation._id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message })
      });

      if (!res.ok) throw new Error('Failed to send message');
      
      setMessage("");
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (file: File) => {
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

  const handleStartEdit = (msg: any) => {
    setEditingMessage(msg._id);
    setEditContent(msg.content);
  };

  useEffect(() => {
    if (!scrollAreaRef.current) return;
    const scrollArea = scrollAreaRef.current;
    
    const handleScroll = () => {
      if (scrollArea.scrollTop === 0 && hasMore && !loading) {
        const currentScrollHeight = scrollArea.scrollHeight;
        setPage(prev => prev + 1);
        // After loading, restore scroll position
        setTimeout(() => {
          const newScrollHeight = scrollArea.scrollHeight;
          scrollArea.scrollTop = newScrollHeight - currentScrollHeight;
        }, 100);
      }
    };

    scrollArea.addEventListener('scroll', handleScroll);
    return () => scrollArea.removeEventListener('scroll', handleScroll);
  }, [hasMore, loading]);

  useEffect(() => {
    if (conversation?._id) {
      fetchMessages(page);
    }
  }, [conversation?._id, page]);

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
          <div className="pr-6"> {/* Add padding for menu button */}
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

        {/* Message actions */}
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
    <>
      <Card className="h-[calc(100vh-12rem)] flex flex-col">
        {/* Student Info Header */}
        <div className="p-4 border-b">
          <h2 className="font-semibold">
            {studentInfo?.name}
          </h2>
          <p className="text-sm text-muted-foreground">Student</p>
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
              {loading && page > 1 && (
                <div className="flex justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              )}
              {messages.map((msg: any, i) => (
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
                disabled={sending}
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
              disabled={!message.trim() || sending}
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

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl w-full p-0 overflow-hidden">
          {selectedImage && (
            <div className="relative w-full h-full">
              <img
                src={selectedImage}
                alt="Full size"
                className="w-full h-full object-contain"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => setSelectedImage(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
