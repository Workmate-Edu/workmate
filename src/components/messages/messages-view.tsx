"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Paperclip, Send, Smile } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState, useEffect, useRef } from "react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { useSocket } from "@/hooks/use-socket";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSocketContext } from "@/contexts/socket-context";



// Add interface for participant
interface Participant {
  userId: string;
  role: string;
  name: string;
  email: string;
}

interface Conversation {
  _id: string;
  participants: Array<{
    userId: string;
    role: string;
    name: string;
    email: string;
  }>;
}

export function MessagesView({ conversationId }: { conversationId: string }) {
  const { data: session } = useSession();
  const { socket, isConnected } = useSocketContext();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [isConnect, setIsConnected] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  // Helper function to get the other participant's details based on role
  const getOtherParticipant = () => {
    if (!conversation?.participants || !session?.user?.id) return null;

    const otherParticipant = conversation.participants.find((p: Participant) => {
      // Handle both string and ObjectId cases
      const participantId = typeof p.userId === "object" ? p.userId.toString() : p.userId;
      return participantId !== session.user.id;
    });

    if (!otherParticipant) return null;

    return {
      name: otherParticipant.name || "",
      role: otherParticipant.role || "",
      info: session.user.role === "teacher" ? `Student` : otherParticipant.role,
    };
  };

  // Fetch conversation details
  useEffect(() => {
    if (!conversationId) return;

    const fetchConversation = async () => {
      try {
        const res = await fetch(`/api/conversations/${conversationId}`);
        if (!res.ok) throw new Error('Failed to fetch conversation');
        const data = await res.json();
        setConversation(data);
      } catch (error) {
        console.error('Error fetching conversation:', error);
        toast.error('Failed to load conversation');
      }
    };

    fetchConversation();
  }, [conversationId]);

  // Fetch messages when conversation is loaded
  useEffect(() => {
    if (!conversationId) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/conversations/${conversationId}/messages`);
        if (!res.ok) throw new Error('Failed to fetch messages');
        const data = await res.json();
        setMessages(data.messages || []);
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast.error('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [conversationId]);

  // Socket event handlers
  useEffect(() => {
    if (!socket || !conversationId) return;

    // Join conversation room
    socket.emit("join_conversation", conversationId);

    // Listen for new messages
    const handleNewMessage = (newMessage: any) => {
      setMessages((prev) => [...prev, newMessage]);
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    socket.on("new_message", handleNewMessage);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.emit("leave_conversation", conversationId);
    };
  }, [socket, conversationId]);

  // Auto scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!conversation) {
    return (
      <Card className="h-[calc(100vh-12rem)] flex items-center justify-center text-muted-foreground">
        <p>Select a conversation to start messaging</p>
      </Card>
    );
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !conversation?._id || sending) return;

    try {
      setSending(true);

      // Create message object
      const newMessage = {
        _id: Date.now().toString(), // Temporary ID for optimistic update
        conversationId: conversation._id,
        content: message,
        senderId: session?.user?.id,
        senderRole: session?.user?.role,
        senderName: session?.user?.name,
        createdAt: new Date().toISOString(),
        attachments: [],
      };

      // Optimistically update UI
      setMessages((prev) => [...prev, newMessage]);
      setMessage("");
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });

      // Save to database
      const res = await fetch(`/api/conversations/${conversation._id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMessage),
      });

      if (!res.ok) throw new Error("Failed to send message");

      // Emit through socket for other users
      const savedMessage = await res.json();
      setMessages(prev => prev.map(msg => msg._id === newMessage._id ? savedMessage : msg));
      socket?.emit("send_message", { conversationId: conversation._id, messageId: savedMessage._id });
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove optimistically added message on error
      setMessages((prev) => prev.filter((msg) => msg._id !== newMessage._id));
      setMessage(message); // Restore message input
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const otherParticipant = getOtherParticipant();

  return (
    <Card className="h-[calc(100vh-12rem)] flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b">
        <h2 className="font-semibold">{getOtherParticipant()?.name || "Loading..."}</h2>
        <p className="text-xs text-muted-foreground">
          {isConnect ? (
            <span className="flex items-center gap-2">
              <span>Connected</span>
              {getOtherParticipant()?.info && (
                <>
                  <span>•</span>
                  <span>{getOtherParticipant()?.info}</span>
                </>
              )}
            </span>
          ) : (
            "Connecting..."
          )}
        </p>
      </div>

      {/* Messages Area with improved spacing */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-4 p-6 min-h-full">
          <div className="h-4" />

          {messages.map((msg: any, index: number) => {
            const isSelf = msg.senderId === session?.user?.id;
            const showAvatar =
              !isSelf && (!messages[index - 1] || messages[index - 1].senderId !== msg.senderId);

            return (
              <div
                key={msg._id}
                className={cn(
                  "flex items-start gap-2 group",
                  isSelf ? "flex-row-reverse" : "flex-row"
                )}
              >
                {/* Avatar for received messages */}
                {!isSelf && (
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex-shrink-0",
                      !showAvatar && "invisible"
                    )}
                  >
                    <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-medium">{msg.senderName?.[0] || "U"}</span>
                    </div>
                  </div>
                )}

                <div className={cn("flex flex-col", isSelf ? "items-end" : "items-start")}>
                  {/* Sender name */}
                  {!isSelf && showAvatar && (
                    <span className="text-xs text-muted-foreground ml-1 mb-1">{msg.senderName}</span>
                  )}

                  {/* Message bubble */}
                  <div
                    className={cn(
                      "max-w-[80%] px-4 py-2 rounded-2xl",
                      isSelf
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-muted rounded-bl-none"
                    )}
                  >
                    <p className="text-sm break-words">{msg.content}</p>

                    {/* Time - only visible on hover or last message */}
                    <p
                      className={cn(
                        "text-[10px] mt-1",
                        isSelf ? "text-primary-foreground/70" : "text-muted-foreground",
                        index === messages.length - 1
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100"
                      )}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          <div ref={scrollRef} className="h-4" />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t mt-auto">
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
                <EmojiPicker onEmojiClick={handleEmojiClick} width="100%" />
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
              disabled={sending}
            >
              <Paperclip className="h-5 w-5" />
            </Button>
          </div>

          <Button type="submit" size="icon" disabled={!message.trim() || sending}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
}
