"use client"

import { Menu, X } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useSession } from "next-auth/react"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "./ui/button"
import { useAuthStore } from "@/store/auth-store"
import { Logo } from "./logo"
import { UserNav } from "./user-nav"
import { BookOpen } from "lucide-react"


const navItems = [
  { href: "/languages", label: "African Languages" },
  { href: "/stem", label: "STEM" },
  { href: "/about", label: "Our Story" },
  // {
  //   label: 'My Courses',
  //   icon: BookOpen,
  //   href: (role: string) => `/dashboard/student/courses`,
  //   color: "text-indigo-500",
  //   roles: ['student'],
  //   description: 'View your enrolled courses'
  // },
]

export default function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const { data: session, status } = useSession()
  const router = useRouter()
  const authStore = useAuthStore()

  // Loading state
  if (status === "loading") {
    return <div className="h-16 border-b bg-background/95" />
  }

  const isAuthenticated = status === "authenticated"

  const handleSignOut = async () => {
    authStore.signOut()
    await signOut({ redirect: false })
    router.push('/')
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current || !buttonRef.current) return;
      
      // Check if click is inside notification menu
      const isNotificationClick = (event.target as Element)?.closest('[data-notification-menu="true"]');
      
      if (
        isMenuOpen && 
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node) &&
        !isNotificationClick // Don't close if clicking notification menu
      ) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMenuOpen])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur shadow-sm">
      <nav className="container flex h-16 items-center justify-between">
        <Logo />
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6 ml-6">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={typeof item.href === 'function' ? item.href('student') : item.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <UserNav session={session} />
          ) : (
            <>
              <Link href="/sign-in">
                <Button variant="ghost">Sign in</Button>
              </Link>
              <Link href="/sign-up">
                <Button>Get started</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button with enhanced hover */}
        <button 
          ref={buttonRef}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 -mr-2 md:hidden hover:bg-accent rounded-md transition-colors"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Enhanced Mobile Menu */}
        {isMenuOpen && (
          <>
            {/* Remove the backdrop div since we're handling clicks differently now */}
            <div 
              ref={menuRef}
              className="absolute top-full left-0 right-0 z-50 bg-background border-b shadow-lg md:hidden animate-in slide-in-from-top-2"
            >
              <div className="container py-4 flex flex-col space-y-4">
                {/* Nav Items with enhanced hover */}
                <div className="flex flex-col space-y-1">
                  {navItems.map((item) => (
                    <Link 
                      key={item.href} 
                      href={typeof item.href === 'function' ? item.href('student') : item.href}
                      className="text-base font-medium px-4 py-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors active:bg-accent/80"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>

                {/* Auth Buttons with enhanced styling */}
                <div className="flex flex-col gap-2 pt-4 border-t">
                  {isAuthenticated ? (
                    <div className="px-4">
                      <UserNav 
                        session={session} 
                        onNavigate={() => setIsMenuOpen(false)} 
                      />
                    </div>
                  ) : (
                    <>
                      <Link href="/sign-in" onClick={() => setIsMenuOpen(false)}>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start hover:bg-accent hover:text-accent-foreground"
                        >
                          Sign in
                        </Button>
                      </Link>
                      <Link href="/sign-up" onClick={() => setIsMenuOpen(false)}>
                        <Button 
                          className="w-full hover:opacity-90 transition-opacity"
                        >
                          Get started
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </nav>
    </header>
  )
}

// Optional: Add a loading skeleton
function UserSkeleton() {
  return (
    <div className="h-8 w-24 bg-muted animate-pulse rounded" />
  )
}
