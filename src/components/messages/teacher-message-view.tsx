"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Message } from "@/types/message";
import { ConversationList } from "./conversation-list";

export function TeacherMessageView() {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>();
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // Fetch only student conversations
    const fetchStudentConversations = async () => {
      const response = await fetch('/api/conversations?role=student');
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    };
    fetchStudentConversations();
  }, []);

  const handleSelectStudent = async (studentId: string) => {
    setSelectedStudentId(studentId);
    const response = await fetch(`/api/conversations/${studentId}/messages`);
    if (response.ok) {
      const data = await response.json();
      // Update to handle the actual message array
      setMessages(data);
    }
  };

  return (
    <div className="flex h-full">
      <ConversationList 
        conversations={conversations}
        onSelect={handleSelectStudent}
        selectedId={selectedStudentId}
        userRole="teacher"
      />
      <div className="flex-1">
        {selectedStudentId ? (
          <div className="h-full flex flex-col">
            {/* Message display area */}
            <div className="flex-1 overflow-y-auto p-4">
              {messages.map((message) => (
                <div key={message.id} className={`mb-4 ${
                  message.sender.role === 'teacher' ? 'text-right' : 'text-left'
                }`}>
                  <div className={`inline-block p-3 rounded-lg ${
                    message.sender.role === 'teacher' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                  }`}>
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
            {/* Message input */}
            {/* ...Add MessageInput component here... */}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Select a student to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
