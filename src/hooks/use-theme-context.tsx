"use client"

import { createContext, useContext, useState } from "react"
import { themes } from "@/lib/themes"

type Theme = {
  primary: string
  secondary: string
  accent: string
  background: {
    light: string
    dark: string
    accent: string
  }
  text: {
    light: string
    dark: string
    accent: string
    muted: string
  }
  border: string
  gradients: {
    primary: string
    secondary: string
  }
  button: {
    primary: string
    secondary: string
    outline: string
  }
}

type ThemeContextType = {
  currentTheme: "arabic" | "stem"
  setCurrentTheme: (theme: "arabic" | "stem") => void
  theme: Theme
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
    theme: themes[currentTheme] as Theme
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
