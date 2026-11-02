"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"
import { type ButtonProps, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface LoadingLinkButtonProps {
  href: string
  children: React.ReactNode
  className?: string
  variant?: ButtonProps["variant"]
  size?: ButtonProps["size"]
  loadingText?: string
  onNavigate?: () => void
}

export function LoadingLinkButton({
  href,
  children,
  className,
  variant,
  size,
  loadingText = "Loading...",
  onNavigate,
}: LoadingLinkButtonProps) {
  const pathname = usePathname()
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => setLoading(false), [pathname])

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (loading) {
      event.preventDefault()
      return
    }
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    onNavigate?.()
    if (pathname !== href) setLoading(true)
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      aria-disabled={loading || undefined}
      aria-busy={loading || undefined}
      className={cn(buttonVariants({ variant, size }), loading && "pointer-events-none opacity-50", className)}
    >
      {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />{loadingText}</> : children}
    </Link>
  )
}
