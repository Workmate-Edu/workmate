"use client"

import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Search, Users } from "lucide-react"
import { MessagesView } from "@/components/messages/messages-view"
import { MessageList } from "@/components/messages/message-list"
import { ConversationList } from "@/components/messages/conversation-list"

export default function AdminMessagesPage() {
  const { data: session } = useSession()

  // Only allow admin access
  if (session?.user?.role !== 'admin') {
    return null
  }

  return (
    <div className="container py-6">
      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-12rem)]">
        <div className="col-span-4 space-y-4">
          <Card className="h-full p-4">
            <Tabs defaultValue="messages" className="h-full">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="messages">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Messages
                </TabsTrigger>
                <TabsTrigger value="users">
                  <Users className="h-4 w-4 mr-2" />
                  All Users
                </TabsTrigger>
              </TabsList>

              <TabsContent value="messages" className="h-[calc(100%-5rem)]">
                <ConversationList userRole="admin" />
              </TabsContent>

              <TabsContent value="users" className="h-[calc(100%-5rem)]">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <input
                        placeholder="Search users..."
                        className="w-full pl-8 pr-4 py-2 text-sm rounded-md border bg-background"
                      />
                    </div>
                    <select className="px-2 py-2 text-sm rounded-md border bg-background">
                      <option value="all">All Users</option>
                      <option value="teachers">Teachers</option>
                      <option value="students">Students</option>
                      <option value="parents">Parents</option>
                    </select>
                  </div>
                  <ScrollArea className="h-[calc(100vh-16rem)]">
                    <MessageList userRole="admin" />
                  </ScrollArea>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        <div className="col-span-8">
          <MessagesView userRole="admin" />
        </div>
      </div>
    </div>
  )
}
