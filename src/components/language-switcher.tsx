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

export const languages = [
  { name: "العربية", value: "ar" },
  { name: "English", value: "en" },
  { name: "Français", value: "fr" },
  { name: "Español", value: "es" },
  { name: "Deutsch", value: "de" },
];

interface LanguageSwitcherDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export function LanguageSwitcherDialog({ isOpen, onOpenChange }: LanguageSwitcherDialogProps) {
  const { language: activeLanguage, setLanguage } = useAppearance()

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>اختر اللغة</DialogTitle>
          <DialogDescription>
            اختر لغة المحتوى المفضلة لديك. هذا الإعداد سيؤثر على المحتوى المعروض في المستقبل.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 py-4">
          {languages.map((lang) => {
            const isActive = activeLanguage === lang.value
            return (
              <div
                key={lang.value}
                onClick={() => {
                  setLanguage(lang.value);
                  onOpenChange(false);
                }}
                className={cn(
                  "cursor-pointer rounded-lg border-2 p-3 transition-all",
                  isActive ? "border-primary" : "border-muted hover:border-muted-foreground"
                )}
              >
                <div className="flex items-center justify-between">
                    <span className="text-lg">{lang.name}</span>
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
