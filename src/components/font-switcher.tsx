
"use client"

import { useFont } from "./font-provider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

export const fonts = [
  { name: "الافتراضي (Alegreya)", value: "font-body" },
  { name: "Cairo", value: "font-cairo" },
  { name: "Noto Sans Arabic", value: "font-noto-sans-arabic" },
  { name: "Lalezar", value: "font-lalezar" },
  { name: "Tajawal", value: "font-tajawal" },
  { name: "Amiri", value: "font-amiri" },
  { name: "Markazi Text", value: "font-markazi-text" },
  { name: "IBM Plex Sans Arabic", value: "font-ibm-plex-sans-arabic" },
];

interface FontSwitcherDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export function FontSwitcherDialog({ isOpen, onOpenChange }: FontSwitcherDialogProps) {
  const { font: activeFont, setFont } = useFont()

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>اختر الخط</DialogTitle>
          <DialogDescription>
            اختر الخط الذي تفضله لتصفح الموقع.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 py-4">
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
      </DialogContent>
    </Dialog>
  )
}
