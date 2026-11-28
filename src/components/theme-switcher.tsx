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
import { Check, Moon, Sun } from "lucide-react"
import { ScrollArea } from "./ui/scroll-area"

export const DEFAULT_LIGHT_THEME = "theme-default-light"
export const DEFAULT_DARK_THEME = "theme-default-dark"

export const LIGHT_THEME_VALUES = new Set([
  "theme-default-light",
  "theme-arctic-white",
  "theme-vintage-parchment",
  "theme-ocean-breeze",
])

export function isLightTheme(theme?: string | null): boolean {
  if (!theme) return false
  return theme === "light" || LIGHT_THEME_VALUES.has(theme)
}

export const themes = [
  {
    name: "الوضع النهاري الافتراضي ☀️",
    value: "theme-default-light",
    colors: ["#f7f6f2", "#1d8655", "#ffffff"],
    desc: "ورقي ناصع مريح للقراءة والنهار — متوازن وعالي الوضوح",
  },
  {
    name: "الوضع الليلي الافتراضي 🌙",
    value: "theme-default-dark",
    colors: ["#0d0f12", "#29d685", "#14171c"],
    desc: "داكن متزن وهادئ للعين ليلاً — افتراضي أنيق وعالي التباين",
  },
  {
    name: "Deep Slate",
    value: "theme-deep-slate",
    colors: ["#090e1a", "#3891f1", "#101828"],
    desc: "أزرق رمادي عميق — احترافي وهادئ ومتطور",
  },
  {
    name: "Midnight Indigo",
    value: "theme-midnight-indigo",
    colors: ["#0d0b1f", "#9171ef", "#1a1640"],
    desc: "بنفسجي كوني عميق — مستوحى من الكون الواسع",
  },
  {
    name: "Golden Dusk",
    value: "theme-golden-dusk",
    colors: ["#0e0a06", "#fabc0c", "#1a1108"],
    desc: "ذهبي ملكي فاخر — ليالي العرب والصحاري الملكية",
  },
  {
    name: "Forest Sage",
    value: "theme-forest-sage",
    colors: ["#060e09", "#2ec376", "#0c1e10"],
    desc: "أخضر الطبيعة الهادئ — سكينة الغابات والبحر",
  },
  {
    name: "Arctic White",
    value: "theme-arctic-white",
    colors: ["#f2f7ff", "#0a84ff", "#e5effc"],
    desc: "فاتح نظيف وأنيق — مستوحى من تصميم Apple",
  },
  {
    name: "Desert Gold 🏜️",
    value: "theme-desert-gold",
    colors: ["#0f0b05", "#f0a216", "#1a1108"],
    desc: "بُني ذهبي صحراوي — دافئ وفاخر كرمال الغرب",
  },
  {
    name: "Ruby Ember 🔥",
    value: "theme-ruby-ember",
    colors: ["#0f0505", "#e92c2c", "#1a0808"],
    desc: "أحمر ياقوتي ناري — قوي وجريء كالجمر المتأجج",
  },
  {
    name: "Aqua Deep 🌊",
    value: "theme-aqua-deep",
    colors: ["#030c0d", "#0cd7d2", "#061518"],
    desc: "أزرق مائي عميق — هادئ وحديث كعمق البحار",
  },
  {
    name: "Rose Garden 🌸",
    value: "theme-rose-garden",
    colors: ["#0e0609", "#f24b82", "#1a0c11"],
    desc: "وردي فاخر راقٍ — دافئ كبتلات الورد الجوري",
  },
  {
    name: "Obsidian Neon ⚫",
    value: "theme-obsidian-neon",
    colors: ["#080808", "#1edc64", "#0d0d0d"],
    desc: "أسود عميق ونيون أخضر — عالم السايبربانك الرقمي",
  },
  {
    name: "Emerald Oasis 🌴",
    value: "theme-emerald-oasis",
    colors: ["#050c08", "#10b981", "#0b1c12"],
    desc: "أخضر زمردي وذهبي دافئ — مستوحى من واحات النخيل الخصبة",
  },
  {
    name: "Vintage Parchment 📜",
    value: "theme-vintage-parchment",
    colors: ["#fbf7f0", "#8c6239", "#f2ebd9"],
    desc: "مخطوطة عتيقة دافئة — طابع الكتب والوثائق التاريخية الكلاسيكية (فاتح)",
  },
  {
    name: "Royal Velvet 👑",
    value: "theme-royal-velvet",
    colors: ["#0d0514", "#8b5cf6", "#1a0b29"],
    desc: "بنفسجي مخملي ملكي — مستوحى من الأروقة والقصور والتحف الكلاسيكية",
  },
  {
    name: "Ocean Breeze 🌀",
    value: "theme-ocean-breeze",
    colors: ["#f0f8ff", "#0ea5e9", "#e0f2fe"],
    desc: "نسيم البحر الفاتح — أزرق سماوي صافي مريح ومشرق (فاتح)",
  },
  {
    name: "الروضة الشريفة 🕌",
    value: "theme-rawdah",
    colors: ["#020d08", "#c5a880", "#041a10"],
    desc: "أخضر زمردي وهادئ — مستوحى من الروضة الشريفة والسكينة الإيمانية",
  },
  {
    name: "كسوة الكعبة 🕋",
    value: "theme-kaaba",
    colors: ["#050508", "#d4af37", "#0b0c10"],
    desc: "أسود وذهبي فاخر — مستوحى من كسوة الكعبة المشرفة وهيبة الحرم",
  },
  {
    name: "سماء الليل 🌌",
    value: "theme-night-sky",
    colors: ["#050716", "#818cf8", "#090d26"],
    desc: "أزرق داكن وهادئ — مستوحى من سماء الليل الصافية والهدوء والوقار",
  },
  {
    name: "شروق الفجر 🌅",
    value: "theme-dawn-sunrise",
    colors: ["#0a0805", "#f59e0b", "#16110a"],
    desc: "بني دافئ مائل للبرتقالي — مستوحى من شروق الفجر والبدايات المباركة",
  },
  {
    name: "الوقار الكلاسيكي 🏛️",
    value: "theme-classic-dignity",
    colors: ["#0a0a0c", "#2dd4bf", "#131a1a"],
    desc: "داكن هادئ مع لمسة تركوازية — للهدوء البصري والتركيز والوقار الكلاسيكي",
  },
]

interface ThemeSwitcherDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export function ThemeSwitcherDialog({ isOpen, onOpenChange }: ThemeSwitcherDialogProps) {
  const { theme: rawTheme, resolvedTheme, setTheme } = useTheme()
  const activeTheme = !rawTheme || rawTheme === "system" ? resolvedTheme : rawTheme
  const currentlyLight = isLightTheme(activeTheme)

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-popover text-popover-foreground border-border rounded-3xl shadow-2xl overflow-hidden">
        <DialogHeader className="text-center pt-4 pb-2">
          <DialogTitle className="text-2xl sm:text-3xl font-black font-headline text-foreground mb-1">
            اختر المظهر والثيم
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-muted-foreground">
            بدّل فوراً بين الوضعين الافتراضيين (النهاري والليلي) أو اختر من بقية اللوحات.
          </DialogDescription>
        </DialogHeader>

        {/* Quick 2-Mode Selector (Day & Night Defaults) */}
        <div className="grid grid-cols-2 gap-3 pt-2" dir="rtl">
          <button
            type="button"
            onClick={() => {
              setTheme(DEFAULT_LIGHT_THEME)
              onOpenChange(false)
            }}
            className={cn(
              "flex items-center justify-center gap-2.5 h-12 rounded-2xl border font-black text-sm transition-colors cursor-pointer",
              currentlyLight
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-muted/60 text-foreground border-border hover:border-primary/40"
            )}
          >
            <Sun className="w-4 h-4" />
            <span>الوضع النهاري</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTheme(DEFAULT_DARK_THEME)
              onOpenChange(false)
            }}
            className={cn(
              "flex items-center justify-center gap-2.5 h-12 rounded-2xl border font-black text-sm transition-colors cursor-pointer",
              !currentlyLight
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-muted/60 text-foreground border-border hover:border-primary/40"
            )}
          >
            <Moon className="w-4 h-4" />
            <span>الوضع الليلي</span>
          </button>
        </div>

        <ScrollArea className="max-h-[52vh] pl-2 pr-3" dir="rtl">
          <div className="grid grid-cols-1 gap-3 py-4 px-1">
            {themes.map((theme) => {
              const isActive =
                activeTheme === theme.value ||
                (activeTheme === "light" && theme.value === DEFAULT_LIGHT_THEME) ||
                (activeTheme === "dark" && theme.value === DEFAULT_DARK_THEME)
              return (
                <button
                  key={theme.value}
                  type="button"
                  onClick={() => {
                    setTheme(theme.value)
                    onOpenChange(false)
                  }}
                  className={cn(
                    "w-full text-right relative cursor-pointer rounded-2xl border p-4 sm:p-5 transition-colors flex items-center justify-between gap-4 group",
                    isActive
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:bg-muted/50"
                  )}
                >
                  <div className="w-8 flex items-center justify-start shrink-0">
                    {isActive ? (
                      <div className="bg-primary p-1.5 rounded-full">
                        <Check className="h-3.5 w-3.5 text-primary-foreground stroke-[3px]" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-border group-hover:border-muted-foreground/50 transition-colors" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3
                      className={cn(
                        "font-black text-base sm:text-lg transition-colors truncate",
                        isActive ? "text-primary" : "text-foreground"
                      )}
                    >
                      {theme.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-1">
                      {theme.desc}
                    </p>
                  </div>

                  <div className="flex gap-1.5 shrink-0 items-center bg-muted/60 p-1.5 rounded-full border border-border">
                    {theme.colors.map((color, index) => (
                      <div
                        key={`${color}-${index}`}
                        className="h-6 w-6 rounded-full border border-border/80"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
