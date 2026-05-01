
"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Check, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { useAppearance, gradientPresets } from "./appearance-provider"

interface GradientSwitcherDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export function GradientSwitcherDialog({ isOpen, onOpenChange }: GradientSwitcherDialogProps) {
  const { gradientPreset: activePreset, setGradientPreset } = useAppearance()

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-[#050508]/95 backdrop-blur-3xl border-white/5 rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.9)] overflow-hidden">
        <DialogHeader className="text-center pt-8 pb-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
             <Sparkles className="h-8 w-8 text-primary animate-pulse" />
          </div>
          <DialogTitle className="text-4xl font-black font-headline text-white mb-2">التدرجات السينمائية</DialogTitle>
          <DialogDescription className="text-lg text-muted-foreground/80">
            اختر التدرج اللوني الذي يحدد مزاج المنصة وشعورها البصري.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6 px-4">
          {gradientPresets.map((preset) => {
            const isActive = activePreset === preset.value
            return (
              <motion.div
                key={preset.name}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setGradientPreset(preset.value); onOpenChange(false); }}
                className={cn(
                  "relative cursor-pointer rounded-[2rem] border-2 p-5 transition-all duration-500 group overflow-hidden h-32 flex flex-col justify-end",
                  isActive 
                    ? "border-primary bg-primary/5 shadow-[0_0_40px_rgba(var(--primary-rgb),0.2)]" 
                    : "border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]"
                )}
              >
                {/* Background Gradient Preview */}
                <div 
                    className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity duration-700"
                    style={{
                        background: `linear-gradient(135deg, hsl(${preset.colors[0]}), hsl(${preset.colors[1]}), hsl(${preset.colors[2]}), hsl(${preset.colors[3]}))`
                    }}
                />
                
                {/* Glass Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="relative z-10 flex items-center justify-between w-full">
                    <div className="text-right">
                        <h3 className={cn(
                            "font-black text-lg transition-colors duration-300",
                            isActive ? "text-primary" : "text-white group-hover:text-primary"
                        )}>
                            {preset.name}
                        </h3>
                    </div>

                    {isActive && (
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="bg-primary p-1 rounded-full shadow-lg"
                        >
                            <Check className="h-4 w-4 text-primary-foreground stroke-[3px]" />
                        </motion.div>
                    )}
                </div>

                {/* Animated Light Beam */}
                <div className="absolute -inset-x-full top-0 h-full w-[200%] bg-gradient-to-r from-transparent via-white/[0.05] to-transparent skew-x-[-25deg] group-hover:translate-x-full transition-transform duration-1000" />
              </motion.div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
