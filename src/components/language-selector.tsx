"use client"

import * as React from "react"
import { useLanguage } from "@/components/providers/language-provider"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"

const languages = {
  en: "English",
  ha: "Hausa"
}

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage()

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Globe className="h-4 w-4" />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white dark:bg-gray-800 p-1 shadow-md"
          align="end"
        >
          {Object.entries(languages).map(([code, name]) => (
            <DropdownMenu.Item
              key={code}
              className={`relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${
                language === code ? "bg-gray-100 dark:bg-gray-700" : ""
              }`}
              onClick={() => setLanguage(code as "en" | "ha")}
            >
              {name}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
