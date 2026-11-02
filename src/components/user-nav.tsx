"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import type { Session } from "next-auth"
import { NotificationMenu } from "@/components/notifications/notification-menu"
import Link from "next/link"
import { ChevronDown, LogOut, Settings, UserRound } from "lucide-react"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"

interface UserNavProps {
  session: Session | null
  onNavigate?: () => void
}

export function UserNav({ session, onNavigate }: UserNavProps) {
  const router = useRouter()
  
  if (!session?.user) return null

  const userInitials = session.user.name
    ?.trim().split(/\s+/)
    .map(n => n[0])
    .slice(0, 2).join('')
    .toUpperCase() || "U"

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
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2 rounded-full px-2" aria-label="Open account menu">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">{userInitials}</AvatarFallback>
            </Avatar>
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 max-w-[calc(100vw-2rem)]" data-user-menu="true">
          <DropdownMenuLabel>
            <p className="truncate font-semibold">{session.user.name || "Your account"}</p>
            <p className="truncate text-xs font-normal text-muted-foreground">{session.user.email}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/profile" onClick={onNavigate}><UserRound className="mr-2 h-4 w-4" aria-hidden="true" />Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings" onClick={onNavigate}><Settings className="mr-2 h-4 w-4" aria-hidden="true" />Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => { onNavigate?.(); void signOut({ callbackUrl: '/' }) }}>
            <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
