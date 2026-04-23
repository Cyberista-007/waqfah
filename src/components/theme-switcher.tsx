
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
import { ScrollArea } from "./ui/scroll-area"

export const themes = [
  { 
    name: "Deep Slate (الافتراضي)", 
    value: "theme-deep-slate", 
    colors: ["#0f1623", "#3b82f6", "#1e293b"],
    desc: "أزرق رمادي عميق، احترافي وهادئ"
  },
  { 
    name: "Midnight Indigo", 
    value: "theme-midnight-indigo", 
    colors: ["#100d1f", "#a78bfa", "#1e1a3d"],
    desc: "بنفسجي فضائي غامق وراقٍ"
  },
  { 
    name: "Golden Dusk", 
    value: "theme-golden-dusk", 
    colors: ["#100c08", "#f59e0b", "#1c1209"],
    desc: "ذهبي داكن فاخر، مستوحى من ليالي العرب"
  },
  { 
    name: "Forest Sage", 
    value: "theme-forest-sage", 
    colors: ["#061210", "#34d399", "#0d2218"],
    desc: "أخضر طبيعي هادئ ومريح للعين"
  },
  { 
    name: "Arctic White", 
    value: "theme-arctic-white", 
    colors: ["#f5f9ff", "#1d6cf0", "#e8f0fe"],
    desc: "فاتح نظيف حديث وأنيق"
  },
];


interface ThemeSwitcherDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export function ThemeSwitcherDialog({ isOpen, onOpenChange }: ThemeSwitcherDialogProps) {
  const { theme: activeTheme, setTheme } = useTheme()

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-headline">اختر الثيم</DialogTitle>
          <DialogDescription>
            اختر لوحة الألوان التي تمنح الموقع مظهرك المثالي.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-3 py-4">
          {themes.map((theme) => {
            const isActive = activeTheme === theme.value
            return (
              <div
                key={theme.name}
                onClick={() => { setTheme(theme.value); onOpenChange(false); }}
                className={cn(
                  "cursor-pointer rounded-2xl border-2 p-4 transition-all duration-300 flex items-center gap-4",
                  isActive 
                    ? "border-primary bg-primary/10 shadow-lg shadow-primary/20" 
                    : "border-border/50 hover:border-primary/50 hover:bg-card/80"
                )}
              >
                <div className="flex gap-1.5 shrink-0">
                  {theme.colors.map((color, index) => (
                    <div
                      key={`${color}-${index}`}
                      className="h-8 w-8 rounded-full border border-white/10 shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-foreground">{theme.name}</p>
                  {'desc' in theme && <p className="text-xs text-muted-foreground mt-0.5 truncate">{(theme as any).desc}</p>}
                </div>
                {isActive && <Check className="h-5 w-5 text-primary shrink-0" />}
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
