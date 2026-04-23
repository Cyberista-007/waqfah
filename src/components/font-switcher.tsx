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
  { name: "كايرو (الافتراضي)", value: "font-body" },
  { name: "تجوال (عصري)", value: "font-tajawal" },
  { name: "أميري (نسخ كلاسيكي)", value: "font-amiri" },
  { name: "المراعي (ناعم)", value: "font-almarai" },
  { name: "لاليزار (عرض)", value: "font-lalezar" },
  { name: "نوتو (قياسي)", value: "font-noto-sans-arabic" },
  { name: "آي بي إم (تقني)", value: "font-ibm-plex-sans-arabic" },
  { name: "تشانجا (هندسي)", value: "font-changa" },
  { name: "المسيري (أنيق)", value: "font-el-messiri" },
  { name: "ريم كوفي (كوفي)", value: "font-reem-kufi" },
  { name: "مركزي (أدبي)", value: "font-markazi-text" },
  { name: "شهرزاد (تراثي)", value: "font-scheherazade-new" },
  { name: "مدى (بسيط)", value: "font-mada" },
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
