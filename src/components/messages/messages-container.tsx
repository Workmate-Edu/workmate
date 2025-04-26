"use client"

import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Search, Users } from "lucide-react"
import { MessagesView } from "./messages-view"
import { MessageList } from "./message-list"
import { ConversationList } from "./conversation-list"

interface MessagesContainerProps {
  userRole: 'student' | 'teacher' | 'parent' | 'admin'
}

export function MessagesContainer({ userRole }: MessagesContainerProps) {
  // Add role-specific logic here
  const getUsersLabel = () => {
    switch (userRole) {
      case 'student':
        return 'Teachers'
      case 'teacher':
        return 'Students'
      case 'parent':
        return 'Teachers'
      case 'admin':
        return 'Users'
      default:
        return 'Users'
    }
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
                  {getUsersLabel()}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="messages" className="h-[calc(100%-5rem)]">
                <ConversationList userRole={userRole} />
              </TabsContent>

              <TabsContent value="users" className="h-[calc(100%-5rem)]">
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                      placeholder={`Search ${getUsersLabel().toLowerCase()}...`}
                      className="w-full pl-8 pr-4 py-2 text-sm rounded-md border bg-background"
                    />
                  </div>
                  <ScrollArea className="h-[calc(100vh-16rem)]">
                    <MessageList userRole={userRole} />
                  </ScrollArea>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        <div className="col-span-8">
          <MessagesView userRole={userRole} />
        </div>
      </div>
    </div>
  )
}
