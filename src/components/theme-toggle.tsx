
"use client"

import * as React from "react"
import { Palette } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "./ui/button"
import { themes } from "./theme-switcher"

interface ThemeToggleProps {
  onClick?: () => void;
}

export function ThemeToggle({ onClick }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    if (onClick) {
      onClick();
      return;
    }
    const currentIndex = themes.findIndex((t) => t.value === theme)
    const nextIndex = (currentIndex + 1) % themes.length
    const nextTheme = themes[nextIndex]?.value
    if (nextTheme) {
      setTheme(nextTheme)
    }
  }

  return (
    <Button
      onClick={toggleTheme}
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      className="text-foreground/70 hover:text-primary transition-all hover:bg-primary/10 rounded-full"
    >
      <Palette className="h-5 w-5" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
