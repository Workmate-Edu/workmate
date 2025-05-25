"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import type { Session } from "next-auth"
import { NotificationMenu } from "@/components/notifications/notification-menu"

interface UserNavProps {
  session: Session | null
  onNavigate?: () => void
}

export function UserNav({ session, onNavigate }: UserNavProps) {
  const router = useRouter()
  
  if (!session?.user) return null

  const userInitials = session.user.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()

  const handleNavigation = (path: string) => {
    onNavigate?.()
    router.push(path)
  }

  return (
    <div className="ml-auto flex items-center gap-4">
      <NotificationMenu onNavigate={onNavigate} />
      
      <Button 
        variant="ghost"
        onClick={() => handleNavigation('/dashboard')}
      >
        Dashboard
      </Button>
      
      <Button 
        variant="ghost"
        onClick={() => {
          onNavigate?.()
          signOut({ callbackUrl: '/' })
        }}
      >
        Sign out
      </Button>

      <Avatar className="h-8 w-8">
        <AvatarFallback>{userInitials}</AvatarFallback>
      </Avatar>
    </div>
  )
}
