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
    { name: "أسود حالك (Obsidian)", hex: "#000000" },
    { name: "فحمي غامق (Carbon)", hex: "#0a0a0c" },
    { name: "أزرق ليلي (Deep Space)", hex: "#040914" },
    { name: "بنفسجي داكن (Imperial)", hex: "#0d0517" },
    { name: "أخضر داكن (Shadow Emerald)", hex: "#030c06" },
    { name: "عنابي ملكي (Royal Burgundy)", hex: "#0f0303" },
    { name: "بني دافئ (Warm Umber)", hex: "#0f0b08" },
    { name: "رمادي برونزي (Slate)", hex: "#161719" },
]

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
      <DialogContent className="max-w-2xl border-2 border-primary/10 bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black font-headline text-center">خلفيات الألوان السادة</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            اختر لوناً موحداً وراقياً ليكون الخلفية الأساسية للموقع.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] px-2">
            <div className="space-y-8 py-4">
                {/* Clear option */}
                <div className="flex justify-between items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                    <div>
                        <h4 className="font-bold text-sm">استعادة الخلفية الافتراضية</h4>
                        <p className="text-xs text-muted-foreground">إزالة اللون الموحد والرجوع إلى خلفية التدرج الحركي.</p>
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
                            
                            return (
                                <div
                                    key={color.hex}
                                    onClick={() => handleSelectColor(color.hex)}
                                    className={cn(
                                        "cursor-pointer rounded-2xl border-2 p-3 transition-all relative aspect-[4/3] flex flex-col justify-between group overflow-hidden shadow-lg",
                                        isActive 
                                            ? "border-primary shadow-primary/20" 
                                            : "border-white/5 hover:border-white/20 hover:shadow-black/50"
                                    )}
                                    style={{ backgroundColor: color.hex }}
                                >
                                    {/* Accent shine */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    
                                    <div className="flex justify-between items-start z-10">
                                        <span className="text-[10px] font-mono bg-black/40 text-white/70 px-2 py-0.5 rounded-full uppercase">{color.hex}</span>
                                        {isActive && (
                                            <span className="bg-primary text-primary-foreground rounded-full p-0.5 animate-in zoom-in duration-200">
                                                <Check className="h-3 w-3" />
                                            </span>
                                        )}
                                    </div>

                                    <span className="text-xs font-black text-white bg-black/50 px-2.5 py-1 rounded-xl z-10 w-fit backdrop-blur-sm truncate max-w-full">
                                        {color.name}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Custom Color Selector */}
                <div className="bg-white/5 p-6 rounded-2xl border border-white/5 space-y-4">
                    <div className="flex items-center gap-3">
                        <Palette className="w-5 h-5 text-primary" />
                        <h4 className="font-bold text-sm">مُنقّي الألوان المخصصة</h4>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="relative w-full sm:w-24 h-12 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center cursor-pointer bg-muted">
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
