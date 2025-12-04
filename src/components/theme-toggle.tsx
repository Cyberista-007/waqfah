
"use client"

import * as React from "react"
import { Moon, Sun, Palette } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { Button } from "./ui/button"

interface ThemeToggleProps {
    openThemeSwitcher: () => void;
}

export function ThemeToggle({ openThemeSwitcher }: ThemeToggleProps) {
  const { setTheme, resolvedTheme } = useTheme()
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  // Avoid rendering toggle with incorrect state during SSR
  if (!isMounted) {
    return <div className="h-10 w-10" />
  }

  const toggleTheme = () => {
    // This logic ensures we toggle between the two default themes
    if (resolvedTheme === 'dark') {
      setTheme('theme-default-light');
    } else {
      setTheme('theme-default-dark');
    }
  }
  
  return (
    <Button
      onClick={toggleTheme}
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      className="text-foreground/70 hover:text-primary"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
