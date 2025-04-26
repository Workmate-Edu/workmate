"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Search, Users, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { StudentMessagesView } from "@/components/messages/student/StudentMessagesView"
import { StudentTeacherList } from "@/components/messages/student/StudentTeacherList"
import { StudentConversationList } from "@/components/messages/student/StudentConversationList"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

export default function StudentMessagesPage() {
  const { data: session } = useSession()
  const [activeConversation, setActiveConversation] = useState(null)
  const [activeTab, setActiveTab] = useState("messages")

  const handleSelectTeacher = async (teacher) => {
    try {
      // First check if conversation exists
      const checkRes = await fetch(`/api/conversations/find?participantId=${teacher._id}`);
      const existingConversation = await checkRes.json();

      if (existingConversation) {
        // If conversation exists, just switch to it
        setActiveConversation(existingConversation);
        setActiveTab("messages");
        return;
      }

      // If no existing conversation, create new one
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId: teacher._id,
          participant: {
            userId: teacher._id,
            role: 'teacher',
            name: teacher.name,
            email: teacher.email
          }
        })
      });

      if (!res.ok) throw new Error('Failed to create conversation')
      
      const conversation = await res.json()
      setActiveConversation(conversation)
      // Switch to messages tab after starting a conversation
      setActiveTab("messages")
    } catch (error) {
      console.error(error)
      toast.error("Failed to start conversation with teacher")
    }
  }

  // Only allow student access
  if (session?.user?.role !== 'student') {
    return null
  }

  return (
    <div className="container py-4 md:py-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 h-[calc(100vh-8rem)]">
        {/* Sidebar - Full width on mobile */}
        <Card className={cn(
          "md:col-span-4 p-4",
          activeConversation && "hidden md:block" // Hide on mobile when conversation is active
        )}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="messages">
                <MessageSquare className="h-4 w-4 mr-2" />
                Messages
              </TabsTrigger>
              <TabsTrigger value="users">
                <Users className="h-4 w-4 mr-2" />
                Teachers
              </TabsTrigger>
            </TabsList>

            <TabsContent value="messages" className="h-[calc(100%-5rem)]">
              <StudentConversationList 
                onSelectConversation={(conv) => {
                  setActiveConversation(conv)
                }}
                activeConversation={activeConversation}
              />
            </TabsContent>

            <TabsContent value="users" className="h-[calc(100%-5rem)]">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    placeholder="Search teachers..."
                    className="w-full pl-8 pr-4 py-2 text-sm rounded-md border bg-background"
                  />
                </div>
                <ScrollArea className="h-[calc(100vh-16rem)]">
                  <StudentTeacherList 
                    onSelectTeacher={handleSelectTeacher}
                  />
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Main Chat Area - Full width on mobile */}
        <div className={cn(
          "md:col-span-8",
          !activeConversation && "hidden md:block" // Hide on mobile when no conversation
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

              <StudentMessagesView 
                conversation={activeConversation}
                onSelectConversation={setActiveConversation}
                userRole="student"
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
