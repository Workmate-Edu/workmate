"use client";

import { Card } from "@/components/ui/card";
// ...existing imports from TeacherMessagesView...

interface AdminMessagesViewProps {
  conversation: any;
  onSelectConversation: (conversation: any) => void;
}

export function AdminMessagesView({ conversation }: AdminMessagesViewProps) {
  const { data: session } = useSession();
  const { socket, isConnected } = useSocketContext();
  const [messages, setMessages] = useState([]);
  // ...existing state setup from TeacherMessagesView...

  // Get teacher from conversation
  const teacher = conversation?.participants.find(p => p.role === 'teacher');

  // ...reuse existing useEffects and handlers from TeacherMessagesView...

  return (
    <Card className="h-[calc(100vh-12rem)] flex flex-col">
      {/* Teacher Info Header */}
      <div className="p-4 border-b">
        <h2 className="font-semibold">
          {teacher?.name}
        </h2>
        <p className="text-sm text-muted-foreground">Teacher</p>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
        {loading ? (
          <MessageSkeleton />
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
          {/* ...reuse existing message input UI... */}
        </form>
      </div>
    </Card>
  );
}
