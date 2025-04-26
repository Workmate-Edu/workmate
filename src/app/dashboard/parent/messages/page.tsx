"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Search, School, ArrowLeft } from "lucide-react"
import { ParentMessagesView } from "@/components/messages/parent/ParentMessagesView"
import { ParentConversationList } from "@/components/messages/parent/ParentConversationList"
import { ParentChildrenSelect } from "@/components/messages/parent/ParentChildrenSelect"
import { toast } from "sonner"
import { ParentTeacherList } from "@/components/messages/parent/ParentTeacherList"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function ParentMessagesPage() {
  const { data: session } = useSession();
  const [selectedChild, setSelectedChild] = useState<{id: string, name: string} | null>(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [activeTab, setActiveTab] = useState("messages");
  const [searchQuery, setSearchQuery] = useState("");

  // Handler for teacher selection after child is selected
  const handleSelectTeacher = async (teacher: any) => {
    try {
      if (!selectedChild) {
        toast.error("Please select a child first");
        return;
      }

      // Check for existing conversation
      const res = await fetch(`/api/conversations/find?teacherId=${teacher._id}&childId=${selectedChild.id}`);
      if (!res.ok) throw new Error('Failed to check existing conversation');
      const existingConversation = await res.json();

      if (existingConversation) {
        setActiveConversation(existingConversation);
        setActiveTab("messages");
        return;
      }

      // Create new conversation
      const createRes = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId: teacher._id,
          childId: selectedChild.id,
          type: 'parent-teacher'
        })
      });

      if (!createRes.ok) throw new Error('Failed to create conversation');
      const newConversation = await createRes.json();
      setActiveConversation(newConversation);
      setActiveTab("messages");
    } catch (error) {
      console.error(error);
      toast.error("Failed to start conversation");
    }
  };

  // Responsive layout
  return (
    <div className="container py-4 md:py-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 h-[calc(100vh-8rem)]">
        {/* Sidebar - Full width on mobile */}
        <div className={cn(
          "md:col-span-4 space-y-4",
          activeConversation && "hidden md:block"
        )}>
          <ParentChildrenSelect
            selectedChild={selectedChild}
            onSelectChild={(child) => {
              setSelectedChild(child);
              setActiveConversation(null);
            }}
          />

          <Card className="h-full p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="messages">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Messages
                </TabsTrigger>
                <TabsTrigger value="teachers" disabled={!selectedChild}>
                  <School className="h-4 w-4 mr-2" />
                  Teachers
                </TabsTrigger>
              </TabsList>

              <TabsContent value="messages" className="h-[calc(100%-5rem)]">
                <ParentConversationList 
                  onSelectConversation={setActiveConversation}
                  activeConversation={activeConversation}
                />
              </TabsContent>

              <TabsContent value="teachers" className="h-[calc(100%-5rem)]">
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                      placeholder="Search teachers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-4 py-2 text-sm rounded-md border bg-background"
                    />
                  </div>
                  <ScrollArea className="h-[calc(100vh-16rem)]">
                    <ParentTeacherList 
                      onSelectTeacher={handleSelectTeacher}
                      searchQuery={searchQuery}
                      activeTeacherId={activeConversation?.participants?.find(p => p?.role === 'teacher')?.userId}
                    />
                  </ScrollArea>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Main Chat Area - Full width on mobile */}
        <div className={cn(
          "md:col-span-8",
          !activeConversation && "hidden md:block"
        )}>
          {activeConversation ? (
            <div className="h-full flex flex-col">
              {/* Mobile Back Button */}
              <div className="md:hidden p-2 border-b">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveConversation(null)}
                  className="flex items-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Messages
                </Button>
              </div>
              <ParentMessagesView 
                conversation={activeConversation}
                onSelectConversation={setActiveConversation}
                childContext={selectedChild}
              />
            </div>
          ) : (
            <Card className="h-full flex items-center justify-center text-muted-foreground">
              Select a conversation to start messaging
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
