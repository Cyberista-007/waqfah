
"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  // Avoid rendering toggle with incorrect state during SSR
  if (!isMounted) {
    return <div className="h-10 w-10" />
  }

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative inline-flex h-8 w-14 items-center rounded-full px-1 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        theme === "light" ? "bg-primary" : "bg-gray-600"
      )}
      aria-label="Toggle theme"
    >
      <span
        className={cn(
          "absolute inset-y-0 left-1 my-auto flex h-6 w-6 items-center justify-center rounded-full bg-white text-gray-800 shadow-md transition-transform duration-300 ease-in-out",
          theme === "dark" && "translate-x-[26px]"
        )}
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </span>
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
