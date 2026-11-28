"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "./ui/button"
import { cn } from "@/lib/utils"
import { DEFAULT_DARK_THEME, DEFAULT_LIGHT_THEME, isLightTheme } from "./theme-switcher"

interface ThemeToggleProps {
  onClick?: () => void
  className?: string
  showLabel?: boolean
}

export function ThemeToggle({ onClick, className, showLabel = false }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const active = mounted ? theme || resolvedTheme : undefined
  const isLight = isLightTheme(active)

  const handleToggle = () => {
    if (onClick) {
      onClick()
      return
    }
    setTheme(isLight ? DEFAULT_DARK_THEME : DEFAULT_LIGHT_THEME)
  }

  const label = isLight ? "الوضع الليلي" : "الوضع النهاري"

  return (
    <Button
      type="button"
      onClick={handleToggle}
      variant="ghost"
      size={showLabel ? "sm" : "icon"}
      title={label}
      aria-label={label}
      className={cn(
        showLabel
          ? "gap-1.5 rounded-xl text-xs font-bold"
          : "h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-background",
        className
      )}
    >
      {mounted && isLight ? (
        <Moon className="h-4 w-4 shrink-0" />
      ) : (
        <Sun className="h-4 w-4 shrink-0" />
      )}
      {showLabel ? <span>{label}</span> : <span className="sr-only">{label}</span>}
    </Button>
  )
}
