
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
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  // Avoid rendering toggle with incorrect state during SSR
  if (!isMounted) {
    return <div className="h-10 w-10" />
  }
  
  return (
    <Button
      onClick={openThemeSwitcher}
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      className="text-foreground/70 hover:text-primary"
    >
        <Palette className="h-5 w-5" />
    </Button>
  )
}
