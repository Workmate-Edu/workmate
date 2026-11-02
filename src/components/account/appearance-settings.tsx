"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <div className="space-y-2">
      <label htmlFor="account-theme" className="text-sm font-medium">Colour theme</label>
      <select id="account-theme" disabled={!mounted} value={mounted ? theme || "system" : "system"}
        onChange={event => setTheme(event.target.value)}
        className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <option value="system">Use device setting</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
      <p className="text-sm text-muted-foreground">Your choice is saved in this browser.</p>
    </div>
  )
}
