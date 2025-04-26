"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { BookOpen } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface User {
  _id: string
  name: string
  email: string
  role: string
  teacherProfile?: {
    subjects: Array<{
      area: string
      subjects: string[]
    }>
  }
  studentProfile?: {
    grade: string
  }
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

export function MessageList({ onSelectUser, setActiveConversation }: {
  onSelectUser?: (user: User) => void;
  setActiveConversation: (conversation: Conversation | null) => void;
}) {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const handleUserClick = async (user: User) => {
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId: user._id,
          participant: {
            userId: user._id,
            role: user.role,
            name: user.name,
            email: user.email
          }
        })
      })

      if (!res.ok) throw new Error('Failed to create conversation')
      
      const conversation = await res.json()
      setActiveConversation(conversation)
      onSelectUser?.(user)
    } catch (error) {
      console.error(error)
      toast.error("Failed to start conversation")
    }
  }

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true)
        const res = await fetch('/api/messages/users')
        if (res.ok) {
          const data = await res.json()
          // Filter out the current user and show only relevant users
          const filteredUsers = data.filter((user: any) => {
            if (session?.user?.role === 'teacher') {
              return user.role === 'student'
            } else if (session?.user?.role === 'student') {
              return user.role === 'teacher'
            }
            return false
          })
          setUsers(filteredUsers)
        }
      } catch (error) {
        console.error('Error fetching users:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      fetchUsers()
    }
  }, [session])

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-4 text-sm text-muted-foreground">
        No users found
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {users.map((user) => (
        <button
          key={user._id}
          onClick={() => handleUserClick(user)}
          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted text-left"
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <p className="font-medium">{user.name}</p>
            {session?.user?.role === 'student' && user.teacherProfile && (
              <p className="text-sm text-muted-foreground">
                {user.teacherProfile.subjects.map(s => s.area).join(', ')}
              </p>
            )}
            {session?.user?.role === 'teacher' && user.studentProfile && (
              <p className="text-sm text-muted-foreground">
                Grade {user.studentProfile.grade}
              </p>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}
