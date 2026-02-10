"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="outline"
      onClick={() =>
        setTheme(theme === "dark" ? "light" : "dark")
      }
    >
      Toggle Theme
    </Button>
  )
}