"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"
import Link from "next/link"
import type { Session } from "next-auth"
import { NotificationMenu } from "@/components/notifications/notification-menu"

interface UserNavProps {
  session: Session | null
}

export function UserNav({ session }: UserNavProps) {
  if (!session?.user) return null

  const userInitials = session.user.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()

  return (
    <div className="ml-auto flex items-center gap-4">
      <NotificationMenu />
      <Link href="/dashboard">
        <Button variant="ghost">Dashboard</Button>
      </Link>
      <Button 
        variant="ghost"
        onClick={() => signOut({ callbackUrl: '/' })}
      >
        Sign out
      </Button>

      <Avatar className="h-8 w-8">
        <AvatarFallback>{userInitials}</AvatarFallback>
      </Avatar>
    </div>
  )
}
