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
import { Check, XCircle, ArrowRight, Brush } from "lucide-react"
import { ScrollArea } from "./ui/scroll-area"
import { useState, useEffect, useCallback } from "react"
import { Button } from "./ui/button"
import { Label } from "./ui/label"
import { Slider } from "./ui/slider"
import { Input } from "./ui/input"

type Pattern = {
    name: string;
    value: string;
    id?: string;
    color?: string;
    customizable?: boolean;
    defaultState?: {
        color: string;
        opacity: number;
        size: number;
        bgColor?: string;
    }
}

export const patterns: Pattern[] = [
    { name: "Bank Note", value: 'url("data:image/svg+xml,%3Csvg width=\'80\' height=\'80\' viewBox=\'0 0 80 80\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%236c6c6c\' fill-opacity=\'0.2\'%3E%3Cpath d=\'M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z\' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' },
    { name: "Circuit Board", value: 'url("data:image/svg+xml,%3Csvg width=\'80\' height=\'80\' viewBox=\'0 0 80 80\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%236c6c6c\' fill-opacity=\'0.2\'%3E%3Cpath fill-rule=\'evenodd\' d=\'M0 0h40v40H0V0zm40 40h40v40H40V40zm0-40h2l-2 2V0zm0 40h2l-2 2V40zm-2 2h4l-4 4V42zM0 40h2l-2 2V40z\'/%3E%3C/g%3E%3C/svg%3E")' },
    { name: "Floating Cogs", value: 'url("data:image/svg+xml,%3Csvg width=\'52\' height=\'52\' viewBox=\'0 0 52 52\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%236c6c6c\' fill-opacity=\'0.2\'%3E%3Cpath d=\'M10 10c0-2.21-1.79-4-4-4-2.21 0-4 1.79-4 4s1.79 4 4 4c2.21 0 4-1.79 4-4zm40 40c0-2.21-1.79-4-4-4-2.21 0-4 1.79-4 4s1.79 4 4 4c2.21 0 4-1.79 4-4z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' },
    { name: "Polka Dots", value: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%236c6c6c\' fill-opacity=\'0.2\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")' },
    { name: "Tic Tac Toe", value: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%236c6c6c\' fill-opacity=\'0.2\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M0 40L40 0H20L0 20M40 40V20L20 40\'/%3E%3C/g%3E%3C/svg%3E")' },
    { name: "Wiggle", value: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm0-20c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm20 20c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm0-20c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm20 20c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm0-20c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z\' fill=\'%236c6c6c\' fill-opacity=\'0.2\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")' },
    { id: "bamboo", name: "بامبو", customizable: true, value: '', defaultState: { color: '#742e13', opacity: 0.84, size: 40, bgColor: '#f9a552' } },
]

const generateBambooSvg = (color: string, opacity: number, size: number) => {
    const encodedColor = encodeURIComponent(color);
    const height = (size / 80) * 105;
    // The viewBox is kept constant (0 0 80 105) so the pattern scales correctly within the new width/height.
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${height}' viewBox='0 0 80 105'><g fill-rule='evenodd'><g id='death-star' fill='${encodedColor}' fill-opacity='${opacity}'><path d='M20 10a5 5 0 0 1 10 0v50a5 5 0 0 1-10 0V10zm15 35a5 5 0 0 1 10 0v50a5 5 0 0 1-10 0V45zM20 75a5 5 0 0 1 10 0v20a5 5 0 0 1-10 0V75zm30-65a5 5 0 0 1 10 0v50a5 5 0 0 1-10 0V10zm0 65a5 5 0 0 1 10 0v20a5 5 0 0 1-10 0V75zM35 10a5 5 0 0 1 10 0v20a5 5 0 0 1-10 0V10zM5 45a5 5 0 0 1 10 0v50a5 5 0 0 1-10 0V45zm0-35a5 5 0 0 1 10 0v20a5 5 0 0 1-10 0V10zm60 35a5 5 0 0 1 10 0v50a5 5 0 0 1-10 0V45zm0-35a5 5 0 0 1 10 0v20a5 5 0 0 1-10 0V10z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
};

interface PatternSwitcherDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export function PatternSwitcherDialog({ isOpen, onOpenChange }: PatternSwitcherDialogProps) {
  const { background, setBackground } = useAppearance();
  
  const [view, setView] = useState<'grid' | 'customize'>('grid');
  const [customizingPattern, setCustomizingPattern] = useState<Pattern | null>(null);

  const [patternColor, setPatternColor] = useState('#742e13');
  const [patternOpacity, setPatternOpacity] = useState(0.8);
  const [patternSize, setPatternSize] = useState(40);
  const [patternBgColor, setPatternBgColor] = useState<string | null>('#f9a552');

  const handleSelectPattern = (pattern: Pattern) => {
    if (pattern.customizable) {
        setCustomizingPattern(pattern);
        if(pattern.defaultState) {
            setPatternColor(pattern.defaultState.color);
            setPatternOpacity(pattern.defaultState.opacity);
            setPatternSize(pattern.defaultState.size);
            setPatternBgColor(pattern.defaultState.bgColor || null);
        }
        setView('customize');
    } else {
        setBackground({ image: pattern.value, color: pattern.color || null, type: 'pattern' });
    }
  }

  const handleBackToGrid = () => {
    setView('grid');
    setCustomizingPattern(null);
  }

  // Effect to apply custom pattern changes
  useEffect(() => {
    if (view === 'customize' && customizingPattern?.id === 'bamboo') {
        const newPatternImage = generateBambooSvg(patternColor, patternOpacity, patternSize);
        setBackground({ image: newPatternImage, color: patternBgColor, type: 'pattern' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, customizingPattern, patternColor, patternOpacity, patternSize, patternBgColor]);


  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if(!open) handleBackToGrid(); onOpenChange(open); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {view === 'customize' && (
                <Button onClick={handleBackToGrid} variant="ghost" size="icon" className="shrink-0">
                    <ArrowRight className="h-5 w-5" />
                </Button>
            )}
            <div>
                 <DialogTitle>{view === 'customize' ? `تخصيص: ${customizingPattern?.name}` : 'اختر نمطًا للخلفية'}</DialogTitle>
                 <DialogDescription>
                    {view === 'customize' ? 'عدّل خصائص النمط ليناسب ذوقك.' : 'اختر أحد الأنماط لتطبيقه كخلفية للموقع.'}
                 </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        {view === 'customize' && customizingPattern ? (
            <div className="space-y-6 pt-4">
                <div className='flex items-center gap-4'>
                    <Label htmlFor="p-color">لون النمط</Label>
                    <Input id="p-color" type="color" value={patternColor} onChange={(e) => setPatternColor(e.target.value)} className="w-16 h-10 p-1" />
                    <Label htmlFor="p-bgcolor">لون الخلفية</Label>
                    <Input id="p-bgcolor" type="color" value={patternBgColor || '#ffffff'} onChange={(e) => setPatternBgColor(e.target.value)} className="w-16 h-10 p-1" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="p-opacity">شفافية النمط: {Math.round(patternOpacity * 100)}%</Label>
                    <Slider id="p-opacity" min={0} max={1} step={0.01} value={[patternOpacity]} onValueChange={(v) => setPatternOpacity(v[0])} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="p-size">كثافة النمط</Label>
                    <Slider id="p-size" min={10} max={200} step={2} value={[patternSize]} onValueChange={(v) => setPatternSize(v[0])} />
                    <p className="text-xs text-muted-foreground">القيمة الأصغر تعني كثافة أعلى.</p>
                </div>
            </div>
        ) : (
            <ScrollArea className="max-h-[60vh]">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4 pr-4">
                <div
                onClick={() => setBackground(null)}
                className={cn(
                    "cursor-pointer rounded-lg border-2 p-2 transition-all flex items-center justify-center bg-background",
                    !background?.image && !background?.color ? "border-primary" : "border-muted hover:border-muted-foreground"
                )}
                >
                <div className="flex flex-col items-center gap-2">
                    <XCircle className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm font-medium">بدون نمط</span>
                </div>
                </div>
                {patterns.map((pattern) => {
                const patternValue = pattern.customizable && pattern.defaultState ? generateBambooSvg(pattern.defaultState.color, pattern.defaultState.opacity, pattern.defaultState.size) : pattern.value;
                const isActive = background?.image === patternValue
                
                return (
                    <div
                    key={pattern.name}
                    onClick={() => handleSelectPattern(pattern)}
                    className={cn(
                        "cursor-pointer rounded-lg border-2 p-2 transition-all relative aspect-square group",
                        isActive && !pattern.customizable ? "border-primary" : "border-muted hover:border-muted-foreground"
                    )}
                    style={{ backgroundImage: patternValue, backgroundColor: (pattern.customizable ? pattern.defaultState?.bgColor : pattern.color) || 'transparent' }}
                    >
                    <div className="absolute bottom-1 right-1 bg-background/80 px-2 py-0.5 rounded-full">
                        <span className="text-xs font-medium">{pattern.name}</span>
                    </div>
                    {isActive && !pattern.customizable && <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5"><Check className="h-4 w-4" /></div>}
                    {pattern.customizable && (
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="secondary" className="h-7 w-7">
                                <Brush className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                    </div>
                )
                })}
            </div>
            </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  )
}
