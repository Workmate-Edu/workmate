"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Search, Users, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { TeacherMessagesView } from "@/components/messages/teacher/TeacherMessagesView"
import { TeacherStudentList } from "@/components/messages/teacher/TeacherStudentList"
import { TeacherConversationList } from "@/components/messages/teacher/TeacherConversationList"
import { toast } from "sonner"

export default function TeacherMessagesPage() {
  const { data: session } = useSession()
  const [activeConversation, setActiveConversation] = useState(null)
  const [activeTab, setActiveTab] = useState("messages")

  const handleSelectStudent = async (student) => {
    try {
      // Check for existing conversation
      const checkRes = await fetch(`/api/conversations/find?participantId=${student._id}`)
      const existingConversation = await checkRes.json()

      if (existingConversation) {
        setActiveConversation(existingConversation)
        setActiveTab("messages")
        return
      }

      // Create new conversation
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId: student._id,
          participant: {
            userId: student._id,
            role: 'student',
            name: student.name,
            email: student.email
          }
        })
      })

      if (!res.ok) throw new Error('Failed to create conversation')
      
      const conversation = await res.json()
      setActiveConversation(conversation)
      setActiveTab("messages")
    } catch (error) {
      console.error(error)
      toast.error("Failed to start conversation with student")
    }
  }

  // Only allow teacher access
  if (session?.user?.role !== 'teacher') {
    return null
  }

  return (
    <div className="container py-4 md:py-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 h-[calc(100vh-8rem)]">
        {/* Sidebar - Full width on mobile */}
        <Card className={cn(
          "md:col-span-4 p-4",
          activeConversation && "hidden md:block"
        )}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="messages">
                <MessageSquare className="h-4 w-4 mr-2" />
                Messages
              </TabsTrigger>
              <TabsTrigger value="users">
                <Users className="h-4 w-4 mr-2" />
                Students
              </TabsTrigger>
            </TabsList>

            <TabsContent value="messages" className="h-[calc(100%-5rem)]">
              <TeacherConversationList 
                onSelectConversation={setActiveConversation}
                activeConversation={activeConversation}
              />
            </TabsContent>

            <TabsContent value="users" className="h-[calc(100%-5rem)]">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    placeholder="Search students..."
                    className="w-full pl-8 pr-4 py-2 text-sm rounded-md border bg-background"
                  />
                </div>
                <ScrollArea className="h-[calc(100vh-16rem)]">
                  <TeacherStudentList 
                    onSelectStudent={handleSelectStudent}
                  />
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Main Chat Area */}
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

              <TeacherMessagesView 
                conversation={activeConversation}
                onSelectConversation={setActiveConversation}
                userRole="teacher"
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
