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
import { Check, Trash2, Palette } from "lucide-react"
import { ScrollArea } from "./ui/scroll-area"
import { Input } from "./ui/input"
import { Label } from "./ui/label"

type SolidColor = {
    name: string;
    hex: string;
}

export const solidColors: SolidColor[] = [
    { name: "ورقي نهاري (Warm Paper)", hex: "#f7f6f2" },
    { name: "أبيض نقي (Pure White)", hex: "#ffffff" },
    { name: "ضباب القطب (Arctic Mist)", hex: "#eef5fc" },
    { name: "مخطوطة دافئة (Parchment)", hex: "#f5efe2" },
    { name: "أسود حالك (Obsidian)", hex: "#000000" },
    { name: "فحمي غامق (Carbon)", hex: "#0a0a0c" },
    { name: "أزرق ليلي (Deep Space)", hex: "#040914" },
    { name: "أخضر داكن (Shadow Emerald)", hex: "#030c06" },
]

function isLightSwatch(hex: string): boolean {
    const clean = hex.replace('#', '');
    if (clean.length !== 6) return false;
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 >= 0.5;
}

interface SolidColorSwitcherDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export function SolidColorSwitcherDialog({ isOpen, onOpenChange }: SolidColorSwitcherDialogProps) {
  const { background, setBackground } = useAppearance();

  const handleSelectColor = (hex: string) => {
    setBackground({ image: null, color: hex, type: 'image' });
  }

  const handleClear = () => {
    setBackground(null);
  }

  const isSolidActive = !background?.image && background?.color;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border border-border bg-card text-foreground">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black font-headline text-center">خلفيات الألوان السادة</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            اختر لوناً موحداً وراقياً ليكون الخلفية الأساسية للموقع.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] px-2">
            <div className="space-y-8 py-4">
                {/* Clear option */}
                <div className="flex justify-between items-center gap-4 bg-muted/60 p-4 rounded-2xl border border-border">
                    <div>
                        <h4 className="font-bold text-sm text-foreground">استعادة الخلفية الافتراضية</h4>
                        <p className="text-xs text-muted-foreground">إزالة اللون الموحد والرجوع إلى لون الثيم التلقائي.</p>
                    </div>
                    <button 
                        onClick={handleClear}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all",
                            !background?.image && !background?.color 
                                ? "bg-primary/20 text-primary border border-primary/30 cursor-default" 
                                : "bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20"
                        )}
                    >
                        <Trash2 className="w-4 h-4" />
                        <span>إعادة التعيين</span>
                    </button>
                </div>

                {/* Grid of Solid Colors */}
                <div className="space-y-4">
                    <Label className="text-xs font-black uppercase text-muted-foreground tracking-wider">الألوان الجاهزة الفاخرة</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {solidColors.map((color) => {
                            const isActive = !background?.image && background?.color === color.hex;
                            const lightSwatch = isLightSwatch(color.hex);
                            
                            return (
                                <div
                                    key={color.hex}
                                    onClick={() => handleSelectColor(color.hex)}
                                    className={cn(
                                        "cursor-pointer rounded-2xl border-2 p-3 transition-all relative aspect-[4/3] flex flex-col justify-between group overflow-hidden shadow-sm",
                                        isActive 
                                            ? "border-primary shadow-primary/20" 
                                            : "border-border hover:border-primary/40"
                                    )}
                                    style={{ backgroundColor: color.hex }}
                                >
                                    <div className="flex justify-between items-start z-10">
                                        <span
                                          className={cn(
                                            "text-[10px] font-mono px-2 py-0.5 rounded-full uppercase",
                                            lightSwatch ? "bg-black/10 text-zinc-900" : "bg-black/40 text-white/80"
                                          )}
                                        >
                                          {color.hex}
                                        </span>
                                        {isActive && (
                                            <span className="bg-primary text-primary-foreground rounded-full p-0.5 animate-in zoom-in duration-200">
                                                <Check className="h-3 w-3" />
                                            </span>
                                        )}
                                    </div>

                                    <span
                                      className={cn(
                                        "text-xs font-black px-2.5 py-1 rounded-xl z-10 w-fit backdrop-blur-sm truncate max-w-full",
                                        lightSwatch ? "bg-black/10 text-zinc-900" : "bg-black/50 text-white"
                                      )}
                                    >
                                        {color.name}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Custom Color Selector */}
                <div className="bg-muted/60 p-6 rounded-2xl border border-border space-y-4">
                    <div className="flex items-center gap-3">
                        <Palette className="w-5 h-5 text-primary" />
                        <h4 className="font-bold text-sm text-foreground">مُنقّي الألوان المخصصة</h4>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="relative w-full sm:w-24 h-12 rounded-xl overflow-hidden border border-border flex items-center justify-center cursor-pointer bg-muted">
                            <input 
                                type="color" 
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                value={isSolidActive ? background.color! : "#121212"}
                                onChange={(e) => handleSelectColor(e.target.value)}
                            />
                            <div 
                                className="w-full h-full" 
                                style={{ backgroundColor: isSolidActive ? background.color! : "#121212" }}
                            />
                        </div>
                        <div className="flex-1 space-y-1 w-full text-center sm:text-right">
                            <p className="text-xs text-muted-foreground">اضغط على المربع بالأعلى لفتح لوحة اختيار أي لون ترغب به بدقة تامة.</p>
                            {isSolidActive && (
                                <p className="text-xs text-primary font-bold">اللون النشط حالياً: <span className="font-mono">{background.color}</span></p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
