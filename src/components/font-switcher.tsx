"use client"

import { useAppearance } from "./appearance-provider"
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

export const fonts = [
  { name: "الافتراضي (Cairo)", value: "font-body" },
  { name: "Tajawal", value: "font-tajawal" },
  { name: "Amiri (عثماني)", value: "font-amiri" },
];

interface FontSwitcherDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export function FontSwitcherDialog({ isOpen, onOpenChange }: FontSwitcherDialogProps) {
  const { font: activeFont, setFont } = useAppearance()

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>اختر الخط</DialogTitle>
          <DialogDescription>
            اختر الخط الذي تفضله لتصفح الموقع.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh]">
          <div className="grid grid-cols-1 gap-4 py-4 pr-4">
            {fonts.map((font) => {
              const isActive = activeFont === font.value
              return (
                <div
                  key={font.name}
                  onClick={() => setFont(font.value)}
                  className={cn(
                    "cursor-pointer rounded-lg border-2 p-3 transition-all",
                    isActive ? "border-primary" : "border-muted hover:border-muted-foreground"
                  )}
                >
                  <div className="flex items-center justify-between">
                      <span className={cn("text-lg", font.value)}>{font.name}</span>
                      {isActive && <Check className="h-5 w-5 text-primary" />}
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
