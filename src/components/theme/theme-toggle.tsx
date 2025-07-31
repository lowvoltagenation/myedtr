"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Moon, Sun, Monitor } from "lucide-react"
import { useHydration } from "@/contexts/HydrationContext"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const { isHydrated } = useHydration()

  if (!isHydrated) {
    return (
      <div className="w-9 h-9 bg-background border border-border rounded-md flex items-center justify-center">
        <div className="w-4 h-4 bg-muted rounded" />
      </div>
    )
  }

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark")
    } else if (theme === "dark") {
      setTheme("system")
    } else {
      setTheme("light")
    }
  }

  const getIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-4 w-4" />
      case "dark":
        return <Moon className="h-4 w-4" />
      case "system":
        return <Monitor className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  const getTooltip = () => {
    switch (theme) {
      case "light":
        return "Switch to dark mode"
      case "dark":
        return "Switch to system mode"
      case "system":
        return "Switch to light mode"
      default:
        return "Switch theme"
    }
  }

  return (
    <button
      onClick={cycleTheme}
      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-border bg-background hover:bg-muted hover:text-accent-foreground h-9 w-9 hover:scale-105 active:scale-95"
      title={getTooltip()}
      aria-label={getTooltip()}
    >
      {getIcon()}
    </button>
  )
} 