
"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Check, Sparkles, Sliders, Palette, Wind, Layers as LayersIcon, Zap, Activity, Droplets, Waves } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAppearance, gradientPresets } from "./appearance-provider"

interface GradientSwitcherDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

const hexToHSL = (hex: string): string => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
    }
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function GradientSwitcherDialog({ isOpen, onOpenChange }: GradientSwitcherDialogProps) {
  const { 
    gradientPreset: activePreset, 
    setGradientPreset,
    customColors,
    setCustomColors,
    auroraSpeed,
    setAuroraSpeed,
    auroraBlur,
    setAuroraBlur,
    auroraComplexity,
    setAuroraComplexity,
    auroraChaos,
    setAuroraChaos,
    auroraSaturation,
    setAuroraSaturation,
    auroraGrain,
    setAuroraGrain
  } = useAppearance()

  const [showCustom, setShowCustom] = useState(activePreset === 'custom')

  const handleColorChange = (index: number, hex: string) => {
      const newColors = [...customColors] as [string, string, string, string];
      newColors[index] = hexToHSL(hex);
      setCustomColors(newColors);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-popover text-popover-foreground border border-border rounded-[2.5rem] shadow-2xl overflow-y-auto max-h-[95vh] custom-scrollbar">
        <DialogHeader className="text-center pt-8 pb-4">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 relative">
             <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-20" />
             <Sparkles className="h-10 w-10 text-primary animate-pulse relative z-10" />
          </div>
          <DialogTitle className="text-4xl sm:text-5xl font-black font-headline text-foreground mb-2 tracking-tight">مختبر التدرجات الفائق</DialogTitle>
          <DialogDescription className="text-lg text-muted-foreground">
             تحكم كامل في فيزياء الألوان، التفاعل، والأجواء البصرية للمنصة.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-12 pb-12 px-6">
            {/* Main Presets Group */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {gradientPresets.map((preset) => {
                    const isActive = activePreset === preset.value
                    return (
                    <motion.div
                        key={preset.name}
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { setGradientPreset(preset.value); setShowCustom(false); }}
                        className={cn(
                        "relative cursor-pointer rounded-[2rem] border-2 p-6 transition-all duration-300 group overflow-hidden h-32 flex flex-col justify-end",
                        isActive 
                            ? "border-primary bg-primary/10 shadow-md" 
                            : "border-border bg-card hover:border-primary/40"
                        )}
                    >
                        <div className="absolute inset-0 opacity-65 group-hover:opacity-85 transition-opacity duration-500"
                            style={{ background: `linear-gradient(135deg, hsl(${preset.colors[0]}), hsl(${preset.colors[1]}), hsl(${preset.colors[2]}), hsl(${preset.colors[3]}))` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                        <div className="relative z-10 flex items-center justify-between w-full">
                            <span className={cn("font-black text-lg text-white")}>{preset.name}</span>
                            {isActive && <div className="bg-primary p-1.5 rounded-full shadow-glow-primary"><Check className="h-4 w-4 text-primary-foreground stroke-[3px]" /></div>}
                        </div>
                    </motion.div>
                    )
                })}

                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setGradientPreset('custom'); setShowCustom(true); }}
                    className={cn(
                        "relative cursor-pointer rounded-[2rem] border-2 p-6 transition-all duration-300 group h-32 flex flex-col justify-end overflow-hidden",
                        activePreset === 'custom' 
                            ? "border-amber-500 bg-amber-500/15 shadow-md" 
                            : "border-border bg-card hover:border-amber-500/40"
                    )}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent opacity-60" />
                    <div className="relative z-10 flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                            <Palette className="h-6 w-6 text-amber-500" />
                            <span className={cn("font-black text-lg", activePreset === 'custom' ? "text-amber-600 dark:text-amber-400" : "text-foreground")}>المختبر الحر</span>
                        </div>
                        {activePreset === 'custom' && <div className="bg-amber-500 p-1.5 rounded-full shadow-lg"><Check className="h-4 w-4 text-black stroke-[3px]" /></div>}
                    </div>
                </motion.div>
            </div>

            {/* Expanded Controls Section */}
            <AnimatePresence>
                {(showCustom || activePreset === 'custom') && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-10"
                    >
                        {/* Physics Lab Panel */}
                        <div className="p-8 sm:p-10 rounded-[2.5rem] bg-card border border-border space-y-10 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Zap className="w-32 h-32 text-primary" />
                            </div>

                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
                                    <Activity className="h-6 w-6 text-primary" />
                                </div>
                                <h4 className="text-2xl font-black font-headline text-foreground">إعدادات المحرك الفائق</h4>
                            </div>

                            {/* Advanced Color Section */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 text-muted-foreground mb-4 px-2">
                                    <Droplets className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">لوحة الألوان المتقدمة</span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    {[0, 1, 2, 3].map((i) => (
                                        <div key={i} className="space-y-4 group/picker">
                                            <div className="relative w-full h-24 rounded-[1.5rem] overflow-hidden border-2 border-border hover:border-primary/50 transition-all shadow-sm group-hover/picker:scale-105 duration-300">
                                                <input 
                                                    type="color" 
                                                    className="absolute inset-[-20px] w-[200%] h-[200%] cursor-pointer bg-transparent"
                                                    onChange={(e) => handleColorChange(i, e.target.value)}
                                                />
                                                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center bg-black/25 backdrop-blur-[2px]">
                                                    <div className="w-8 h-8 rounded-full border-2 border-white/60 shadow-lg mb-2" style={{ background: `hsl(${customColors[i]})` }} />
                                                    <span className="text-[8px] font-black text-white/90 uppercase">Color {i+1}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Sliders Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-6">
                                {/* Row 1 */}
                                <ControlSlider label="سرعة التموج" icon={<Wind className="w-4 h-4" />} value={auroraSpeed} min={0.1} max={5} step={0.1} suffix={`x${auroraSpeed.toFixed(1)}`} onChange={setAuroraSpeed} />
                                <ControlSlider label="كثافة الضبابية" icon={<LayersIcon className="w-4 h-4" />} value={auroraBlur} min={0.5} max={3} step={0.1} suffix={`${Math.round(auroraBlur * 100)}%`} onChange={setAuroraBlur} />
                                
                                {/* Row 2 - Complexity & Chaos */}
                                <ControlSlider label="التعقيد (عدد النقاط)" icon={<Zap className="w-4 h-4" />} value={auroraComplexity} min={3} max={12} step={1} suffix={`${auroraComplexity} نقاط`} onChange={setAuroraComplexity} />
                                <ControlSlider label="عامل الفوضى" icon={<Activity className="w-4 h-4" />} value={auroraChaos} min={0.1} max={3} step={0.1} suffix={`v${auroraChaos.toFixed(1)}`} onChange={setAuroraChaos} />

                                {/* Row 3 - Saturation & Grain */}
                                <ControlSlider label="تشبع الألوان" icon={<Droplets className="w-4 h-4" />} value={auroraSaturation} min={0} max={200} step={5} suffix={`${auroraSaturation}%`} onChange={setAuroraSaturation} />
                                <ControlSlider label="حبيبات الفيلم" icon={<Waves className="w-4 h-4" />} value={auroraGrain} min={0} max={0.1} step={0.005} suffix={`${(auroraGrain * 1000).toFixed(0)}i`} onChange={setAuroraGrain} />
                            </div>

                            <div className="pt-8 border-t border-border flex items-center justify-center gap-6">
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/60 border border-border">
                                    <Waves className="w-3 h-3 text-primary" />
                                    <span className="text-[10px] font-bold text-muted-foreground italic">ميزة "التموج عند النقر" مفعلة تلقائياً</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ControlSlider({ label, icon, value, min, max, step, suffix, onChange }: any) {
    return (
        <div className="space-y-4 group/slider">
            <div className="flex justify-between items-center px-2">
                <div className="flex items-center gap-3 text-muted-foreground group-hover/slider:text-foreground transition-colors duration-300">
                    <div className="p-2 rounded-xl bg-muted border border-border">{icon}</div>
                    <span className="text-sm font-black tracking-wide">{label}</span>
                </div>
                <span className="text-primary font-black text-xs tabular-nums bg-primary/10 px-3 py-1 rounded-lg border border-primary/20">
                    {suffix}
                </span>
            </div>
            <div className="relative pt-1">
                <input 
                    type="range" min={min} max={max} step={step} 
                    value={value}
                    onChange={(e) => onChange(parseFloat(e.target.value))}
                    className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary border border-border transition-all"
                />
                <div className="absolute top-0 left-0 h-full bg-primary/20 rounded-full pointer-events-none" style={{ width: `${((value - min) / (max - min)) * 100}%` }} />
            </div>
        </div>
    )
}
