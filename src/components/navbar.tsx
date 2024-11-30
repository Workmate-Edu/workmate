"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ThemeToggle } from "./theme-toggle"
import Image from "next/image"
import { LanguageSelector } from "@/components/language-selector"
import { useLanguage } from "@/components/providers/language-provider"
import { FiLayout, FiLogIn, FiLogOut } from "react-icons/fi"
import { useThemeContext } from "@/hooks/use-theme-context"
import { useEffect, useState } from "react"
import { Menu } from "lucide-react"
import { Button } from "./ui/button"
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet"
import { useAuth } from "../hooks/use-auth"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"

const publicRoutes = [
  {
    href: "/",
    label: "Home",
  },
  {
    href: "/courses",
    label: "Courses",
  },
  {
    href: "/about",
    label: "About Us",
  },
  {
    href: "/arabic-center",
    label: "Arabic Center",
  },
]

const getDashboardLinks = (role: string) => [
  {
    href: `/dashboard/${role}`,
    label: "Dashboard",
    icon: FiLayout,
  },
]

export function Navbar() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const { setCurrentTheme } = useThemeContext()
  const [open, setOpen] = useState(false)
  const { user, signOut } = useAuth()
  const { status } = useSession()
  const router = useRouter()
  const isDashboard = pathname.startsWith('/dashboard')

  const dashboardLinks = user?.role ? getDashboardLinks(user.role) : []

  const handleSignOut = async () => {
    await signOut()
    router.push('/sign-in')
  }

  const isAuthenticated = status === "authenticated"

  useEffect(() => {
    if (pathname.startsWith('/arabic-center')) {
      setCurrentTheme('arabic')
    } else {
      setCurrentTheme('stem')
    }
  }, [pathname, setCurrentTheme])

  // Close mobile menu when route changes
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      isDashboard && "border-none shadow-sm"
    )}>
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold">   
              <Image
                src="/workmate_logo.png" 
                alt="Workmate"
                width={32} 
                height={32} 
                className="h-8 w-8"
              /> 
            </span>
            <span className="font-bold">Workmate</span>
          </Link>
          
          {/* Navigation Links */}
          {!isDashboard && (
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              {publicRoutes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    pathname === route.href
                      ? "text-foreground"
                      : "text-foreground/60 transition-colors hover:text-foreground/80"
                  )}
                >
                  {route.label}
                </Link>
              ))}
              {isAuthenticated && dashboardLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-1",
                    pathname === link.href
                      ? "text-foreground"
                      : "text-foreground/60 transition-colors hover:text-foreground/80"
                  )}
                >
                  <link.icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              ))}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              !isDashboard && (
                <Button 
                  variant="ghost" 
                  onClick={handleSignOut}
                  className="flex items-center gap-1"
                >
                  <FiLogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </Button>
              )
            ) : !isDashboard && (
              <>
                <Link href="/sign-in">
                  <Button variant="ghost" className="flex items-center gap-1">
                    <FiLogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSelector />
            <ThemeToggle />
          </div>

          {/* Mobile Menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <nav className="flex flex-col space-y-4">
                {!isDashboard && (
                  <>
                    {publicRoutes.map((route) => (
                      <Link
                        key={route.href}
                        href={route.href}
                        className={cn(
                          "text-sm font-medium",
                          pathname === route.href
                            ? "text-foreground"
                            : "text-foreground/60 hover:text-foreground/80"
                        )}
                      >
                        {route.label}
                      </Link>
                    ))}
                    {isAuthenticated && dashboardLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          "flex items-center gap-1 text-sm font-medium",
                          pathname === link.href
                            ? "text-foreground"
                            : "text-foreground/60 hover:text-foreground/80"
                        )}
                      >
                        <link.icon className="w-4 h-4" />
                        <span>{link.label}</span>
                      </Link>
                    ))}
                    {isAuthenticated ? (
                      <Button 
                        variant="ghost" 
                        onClick={handleSignOut}
                        className="flex items-center gap-1 justify-start"
                      >
                        <FiLogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </Button>
                    ) : (
                      <>
                        <Link href="/sign-in" className="flex items-center gap-1 text-sm font-medium">
                          <FiLogIn className="w-4 h-4" />
                          <span>Sign In</span>
                        </Link>
                        <Link href="/sign-up">
                          <Button className="w-full">Sign Up</Button>
                        </Link>
                      </>
                    )}
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
