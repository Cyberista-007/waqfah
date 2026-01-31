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
import { Check, XCircle } from "lucide-react"
import { ScrollArea } from "./ui/scroll-area"

type Pattern = {
    name: string;
    value: string;
    id?: string;
    color?: string;
}

export const patterns: Pattern[] = [
    { name: "Death Star", value: 'url("data:image/svg+xml,%3Csvg width=\'80\' height=\'80\' viewBox=\'0 0 80 80\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%236c6c6c\' fill-opacity=\'0.2\'%3E%3Cpath d=\'M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z\' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' },
    { name: "Circuit Board", value: 'url("data:image/svg+xml,%3Csvg width=\'80\' height=\'80\' viewBox=\'0 0 80 80\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%236c6c6c\' fill-opacity=\'0.2\'%3E%3Cpath fill-rule=\'evenodd\' d=\'M0 0h40v40H0V0zm40 40h40v40H40V40zm0-40h2l-2 2V0zm0 40h2l-2 2V40zm-2 2h4l-4 4V42zM0 40h2l-2 2V40z\'/%3E%3C/g%3E%3C/svg%3E")' },
    { name: "Floating Cogs", value: 'url("data:image/svg+xml,%3Csvg width=\'52\' height=\'52\' viewBox=\'0 0 52 52\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%236c6c6c\' fill-opacity=\'0.2\'%3E%3Cpath d=\'M10 10c0-2.21-1.79-4-4-4-2.21 0-4 1.79-4 4s1.79 4 4 4c2.21 0 4-1.79 4-4zm40 40c0-2.21-1.79-4-4-4-2.21 0-4 1.79-4 4s1.79 4 4 4c2.21 0 4-1.79 4-4z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' },
    { name: "Polka Dots", value: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%236c6c6c\' fill-opacity=\'0.2\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")' },
    { name: "Tic Tac Toe", value: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%236c6c6c\' fill-opacity=\'0.2\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M0 40L40 0H20L0 20M40 40V20L20 40\'/%3E%3C/g%3E%3C/svg%3E")' },
    { name: "Wiggle", value: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm0-20c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm20 20c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm0-20c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm20 20c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm0-20c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z\' fill=\'%236c6c6c\' fill-opacity=\'0.2\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")' },
]


interface PatternSwitcherDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export function PatternSwitcherDialog({ isOpen, onOpenChange }: PatternSwitcherDialogProps) {
  const { background, setBackground } = useAppearance();

  const handleSelectPattern = (pattern: Pattern) => {
    setBackground({ image: pattern.value, color: pattern.color || null, type: 'pattern' });
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>اختر نمطًا للخلفية</DialogTitle>
          <DialogDescription>
            اختر أحد الأنماط لتطبيقه كخلفية للموقع.
          </DialogDescription>
        </DialogHeader>
        
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
            const isActive = background?.image === pattern.value
            
            return (
                <div
                key={pattern.name}
                onClick={() => handleSelectPattern(pattern)}
                className={cn(
                    "cursor-pointer rounded-lg border-2 p-2 transition-all relative aspect-square group",
                    isActive ? "border-primary" : "border-muted hover:border-muted-foreground"
                )}
                style={{
                    backgroundImage: pattern.value,
                    backgroundColor: pattern.color || 'transparent',
                    backgroundSize: 'auto',
                    backgroundPosition: '0 0',
                    backgroundRepeat: 'repeat',
                }}
                >
                <div className="absolute bottom-1 right-1 bg-background/80 px-2 py-0.5 rounded-full">
                    <span className="text-xs font-medium">{pattern.name}</span>
                </div>
                {isActive && <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5"><Check className="h-4 w-4" /></div>}
                </div>
            )
            })}
        </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
