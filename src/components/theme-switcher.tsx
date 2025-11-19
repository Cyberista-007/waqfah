
"use client"

import { useTheme } from "next-themes"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

export const themes = [
  { name: "الافتراضي (داكن)", value: "theme-default-dark", colors: ["#09090b", "#fafafa", "#27272a"] },
  { name: "الافتراضي (فاتح)", value: "theme-default-light", colors: ["#ffffff", "#09090b", "#f4f4f5"] },
  { name: "المسجد الزمردي", value: "theme-emerald-mosque", colors: ["#081412", "#a3f7b5", "#213d36"] },
  { name: "ليالي الصحراء", value: "theme-desert-night", colors: ["#171311", "#fde0c8", "#2c2624"] },
  { name: "الأزرق الملكي", value: "theme-royal-blue", colors: ["#0f172a", "#a9d7ff", "#293952"] },
  { name: "قرمزي وذهبي", value: "theme-crimson-gold", colors: ["#240d0d", "#fde8c8", "#3a2020"] },
  { name: "الزيتون والمريمية", value: "theme-olive-sage", colors: ["#212421", "#d4e0c4", "#3f453f"] },
  { name: "ليالي مكة", value: "theme-mecca-nights", colors: ["#09090b", "#ffd700", "#1c1c1e"] },
  { name: "أخضر مديني", value: "theme-medina-green", colors: ["#0a1a12", "#a3d9b1", "#214c33"] },
  { name: "غروب أندلسي", value: "theme-andalusian-sunset", colors: ["#2a1a14", "#ffccb0", "#45312b"] },
  { name: "أكاديمي فاتح", value: "theme-light-academia", colors: ["#fdf9f3", "#4d3a2a", "#f5efe6"] },
  { name: "لون الرق", value: "theme-parchment", colors: ["#f5f1e9", "#7a3a23", "#e9e3d7"] },
  { name: "داكن كلاسيكي", value: "theme-classic-dark", colors: ["#1e293b", "#e2e8f0", "#334155"] },
  { name: "ليل نيون", value: "theme-night-neon", colors: ["#0b021d", "#d946ef", "#3b0764"] },
  { name: "بركان أحمر", value: "theme-red-volcano", colors: ["#1f0a0a", "#ff6b6b", "#5e1e1e"] },
  { name: "بركان هيكلا", value: "theme-hekla-volcano", colors: ["#191b22", "#93c5fd", "#e03131"] },
  { name: "فضاء عميق", value: "theme-deep-space", colors: ["#0c0a1d", "#a5b4fc", "#4338ca"] },
  { name: "OLED أسود", value: "theme-oled", colors: ["#000000", "#3b82f6", "#ef4444"] },
];


interface ThemeSwitcherDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export function ThemeSwitcherDialog({ isOpen, onOpenChange }: ThemeSwitcherDialogProps) {
  const { theme: activeTheme, setTheme } = useTheme()

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>اختر الثيم</DialogTitle>
          <DialogDescription>
            اختر لوحة الألوان التي تفضلها لتخصيص مظهر الموقع.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4 max-h-[60vh] overflow-y-auto">
          {themes.map((theme) => {
            const isActive = activeTheme === theme.value
            return (
              <div
                key={theme.name}
                onClick={() => setTheme(theme.value)}
                className={cn(
                  "cursor-pointer rounded-lg border-2 p-2 transition-all",
                  isActive ? "border-primary" : "border-muted hover:border-muted-foreground"
                )}
              >
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        {theme.colors.map((color) => (
                            <div
                            key={color}
                            className="h-6 w-6 rounded-full border"
                            style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{theme.name}</span>
                        {isActive && <Check className="h-5 w-5 text-primary" />}
                    </div>
                </div>
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
