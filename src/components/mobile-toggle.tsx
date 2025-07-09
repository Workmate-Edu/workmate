"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSidebarStore } from "@/store/sidebar-store"

export function MobileToggle() {
  const { toggleSidebar } = useSidebarStore()

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="md:hidden"
      onClick={toggleSidebar}
    >
      <Menu className="h-5 w-5" />
    </Button>
  )
}
