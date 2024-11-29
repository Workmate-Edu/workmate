"use client"

import { createContext, useContext, useState } from "react"
import { themes } from "@/lib/themes"

type ThemeContextType = {
  currentTheme: "arabic" | "stem"
  setCurrentTheme: (theme: "arabic" | "stem") => void
  theme: typeof themes.arabic | typeof themes.stem
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeContextProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const [currentTheme, setCurrentTheme] = useState<"arabic" | "stem">("stem")

  const value = {
    currentTheme,
    setCurrentTheme,
    theme: themes[currentTheme]
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useThemeContext() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useThemeContext must be used within a ThemeContextProvider")
  }
  return context
}
