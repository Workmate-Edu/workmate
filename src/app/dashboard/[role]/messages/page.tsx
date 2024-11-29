"use client"

import { Button } from "@/components/ui/button"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { FiEdit, FiSearch, FiSend, FiUser } from "react-icons/fi"
import Image from "next/image"

export default function MessagesPage() {
  // Mock data - would come from API in real app
  const conversations = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      role: "Mathematics Teacher",
      avatar: "/images/placeholder-avatar.jpg",
      lastMessage: "The next parent-teacher meeting is scheduled for Friday",
      time: "2 hours ago",
      unread: true,
    },
    {
      id: 2,
      name: "Mr. Robert Smith",
      role: "Physics Teacher",
      avatar: "/images/placeholder-avatar.jpg",
      lastMessage: "John has shown great improvement in the recent test",
      time: "1 day ago",
      unread: false,
    },
    {
      id: 3,
      name: "Ms. Emily Brown",
      role: "English Teacher",
      avatar: "/images/placeholder-avatar.jpg",
      lastMessage: "Here's the reading list for next semester",
      time: "2 days ago",
      unread: false,
    },
  ]

  const activeConversation = {
    id: 1,
    name: "Dr. Sarah Johnson",
    role: "Mathematics Teacher",
    avatar: "/images/placeholder-avatar.jpg",
    status: "online",
    messages: [
      {
        id: 1,
        sender: "teacher",
        message: "Hello! I wanted to discuss John's progress in Mathematics.",
        time: "10:30 AM",
      },
      {
        id: 2,
        sender: "parent",
        message: "Of course! How is he doing?",
        time: "10:32 AM",
      },
      {
        id: 3,
        sender: "teacher",
        message: "He's doing great! His last test score was excellent. I'd like to discuss some advanced topics we could introduce.",
        time: "10:35 AM",
      },
      {
        id: 4,
        sender: "parent",
        message: "That's wonderful news! I'd be happy to discuss this further.",
        time: "10:36 AM",
      },
      {
        id: 5,
        sender: "teacher",
        message: "The next parent-teacher meeting is scheduled for Friday. Would you be available at 3 PM?",
        time: "10:40 AM",
      },
    ],
  }

  return (
    <DashboardLayout>
    <div className="flex h-[calc(100vh-10rem)] gap-6">
      {/* Conversations List */}
      <Card className="w-80">
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Messages</h3>
            <Button size="icon" variant="ghost">
              <FiEdit className="w-4 h-4" />
            </Button>
          </div>

          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search messages..."
              className="pl-10"
            />
          </div>
        </div>

        <Separator />

        <ScrollArea className="h-[calc(100vh-15rem)]">
          <div className="space-y-2 p-2">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`
                  p-3 rounded-lg cursor-pointer hover:bg-gray-100
                  ${conversation.id === activeConversation.id ? "bg-gray-100" : ""}
                `}
              >
                <div className="flex gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                      <Image
                        src={conversation.avatar}
                        alt={conversation.name}
                        width={48}
                        height={48}
                      />
                    </div>
                    {conversation.unread && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium truncate">{conversation.name}</h4>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                        {conversation.time}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{conversation.role}</p>
                    <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Active Conversation */}
      <Card className="flex-1">
        <div className="h-full flex flex-col">
          {/* Conversation Header */}
          <div className="p-4 flex items-center gap-4 border-b">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
              <Image
                src={activeConversation.avatar}
                alt={activeConversation.name}
                width={48}
                height={48}
              />
            </div>
            <div>
              <h3 className="font-semibold">{activeConversation.name}</h3>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">{activeConversation.role}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-gray-500">Online</span>
                </span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {activeConversation.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "parent" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`
                      max-w-[70%] rounded-lg p-3
                      ${message.sender === "parent"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-900"
                      }
                    `}
                  >
                    <p>{message.message}</p>
                    <span
                      className={`
                        text-xs mt-1 block
                        ${message.sender === "parent" ? "text-blue-100" : "text-gray-500"}
                      `}
                    >
                      {message.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                className="flex-1"
              />
              <Button>
                <FiSend className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
    </DashboardLayout>
  )
}
