
"use client"

import { useTheme } from "next-themes"
import { motion } from "framer-motion"
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
      <DialogContent className="max-w-2xl bg-[#0a0a0f]/95 backdrop-blur-2xl border-white/10 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
        <DialogHeader className="text-center pt-8 pb-4">
          <DialogTitle className="text-4xl font-black font-headline text-white mb-2">اختر الثيم</DialogTitle>
          <DialogDescription className="text-lg text-muted-foreground/80">
            اختر لوحة الألوان التي تمنح الموقع مظهرك المثالي.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 gap-4 py-6 px-2">
          {themes.map((theme) => {
            const isActive = activeTheme === theme.value
            return (
              <motion.div
                key={theme.name}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => { setTheme(theme.value); onOpenChange(false); }}
                className={cn(
                  "relative cursor-pointer rounded-[1.8rem] border-2 p-6 transition-all duration-500 flex items-center justify-between group overflow-hidden",
                  isActive 
                    ? "border-primary bg-primary/5 shadow-[0_0_30px_rgba(var(--primary-rgb),0.15)] ring-1 ring-primary/20" 
                    : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.05]"
                )}
              >
                {/* Active Indicator (Checkmark on far left) */}
                <div className="w-10 flex items-center justify-start">
                  {isActive ? (
                    <motion.div 
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="bg-primary p-1.5 rounded-full shadow-lg shadow-primary/40"
                    >
                        <Check className="h-4 w-4 text-primary-foreground stroke-[3px]" />
                    </motion.div>
                  ) : (
                    <div className="w-7 h-7 rounded-full border-2 border-white/5 group-hover:border-white/20 transition-colors" />
                  )}
                </div>

                {/* Text Content (Middle) */}
                <div className="flex-1 px-6 text-right">
                  <h3 className={cn(
                    "font-black text-xl transition-colors duration-300",
                    isActive ? "text-primary" : "text-white/90 group-hover:text-white"
                  )}>
                    {theme.name}
                  </h3>
                  <p className="text-sm text-muted-foreground/60 mt-1 line-clamp-1 group-hover:text-muted-foreground transition-colors">
                    {theme.desc}
                  </p>
                </div>

                {/* Color Circles (Right) */}
                <div className="flex gap-2 shrink-0 items-center bg-black/20 p-2 rounded-full border border-white/5">
                  {theme.colors.map((color, index) => (
                    <div
                      key={`${color}-${index}`}
                      className="h-8 w-8 rounded-full border border-white/20 shadow-inner group-hover:scale-110 transition-transform duration-300"
                      style={{ 
                        backgroundColor: color,
                        transitionDelay: `${index * 50}ms`
                      }}
                    />
                  ))}
                </div>

                {/* Background Accent for Active Theme */}
                {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-l from-primary/5 via-transparent to-transparent pointer-events-none" />
                )}
              </motion.div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
