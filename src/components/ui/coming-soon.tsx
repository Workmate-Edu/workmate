"use client"

import React from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ComingSoonWrapperProps {
  children: React.ReactNode
  isEnabled?: boolean
  feature?: string
}

export function ComingSoonWrapper({
  children,
  isEnabled = false,
  feature = "",
}: ComingSoonWrapperProps) {
  if (isEnabled) {
    return <>{children}</>
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-not-allowed opacity-60">
            {children}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{feature || "Coming Soon!"} 🚀</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
