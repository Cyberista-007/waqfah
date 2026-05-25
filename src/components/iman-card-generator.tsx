'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dialog, 
  DialogContent, 
  DialogTrigger, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogClose 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  Sparkles, 
  Share2, 
  Copy, 
  Check, 
  Loader2, 
  Moon, 
  Sun, 
  Heart,
  Palette,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Styling themes for card background
const CARD_THEMES = [
  {
    id: 'emerald-dusk',
    name: 'الزمرد الداكن',
    class: 'bg-gradient-to-br from-[#064e3b] via-[#022c22] to-[#01140f] text-emerald-100',
    accentColor: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.2)',
    pattern: 'radial-gradient(circle at 10% 20%, rgba(4, 120, 87, 0.15) 0%, transparent 40%)'
  },
  {
    id: 'indigo-dawn',
    name: 'شفق الفجر',
    class: 'bg-gradient-to-br from-[#1e1b4b] via-[#0f172a] to-[#020617] text-indigo-100',
    accentColor: '#6366f1',
    glowColor: 'rgba(99, 102, 241, 0.2)',
    pattern: 'radial-gradient(circle at 90% 10%, rgba(79, 70, 229, 0.15) 0%, transparent 40%)'
  },
  {
    id: 'amber-glow',
    name: 'وهج الغروب',
    class: 'bg-gradient-to-br from-[#78350f] via-[#451a03] to-[#1c0d02] text-amber-100',
    accentColor: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.2)',
    pattern: 'radial-gradient(circle at 50% 50%, rgba(217, 119, 6, 0.15) 0%, transparent 50%)'
  },
  {
    id: 'charcoal-velvet',
    name: 'المخمل الفاخر',
    class: 'bg-gradient-to-br from-[#1c1917] via-[#0c0a09] to-[#020202] text-stone-100',
    accentColor: '#d6d3d1',
    glowColor: 'rgba(214, 211, 209, 0.1)',
    pattern: 'radial-gradient(circle at 30% 80%, rgba(120, 113, 108, 0.1) 0%, transparent 40%)'
  },
  {
    id: 'royal-purple',
    name: 'بنفسجي ملكي',
    class: 'bg-gradient-to-br from-[#581c87] via-[#2e1065] to-[#0f052d] text-purple-100',
    accentColor: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.2)',
    pattern: 'radial-gradient(circle at 80% 80%, rgba(147, 51, 234, 0.15) 0%, transparent 55%)'
  }
];

interface ImanCardGeneratorProps {
  title: string;          // e.g. "حديث شريف" or "آية قرآنية"
  content: string;        // The core text
  secondaryContent?: string; // Optional: answer or explanation
  source?: string;        // e.g. "سورة البقرة: ٢٥٥"
  trigger?: React.ReactNode;
}

export function ImanCardGenerator({ 
  title, 
  content, 
  secondaryContent, 
  source,
  trigger 
}: ImanCardGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState(CARD_THEMES[0]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleCopyText = async () => {
    try {
      const shareText = `*${title}*\n\n${content}\n${secondaryContent ? `\nالإجابة:\n${secondaryContent}\n` : ''}\n📍 المصدر: ${source || 'منصة وقفة'}`;
      await navigator.clipboard.writeText(shareText);
      setIsCopied(true);
      toast({
        title: "تم نسخ النص!",
        description: "يمكنك الآن مشاركته مباشرة.",
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);

    try {
      // Dynamically import html-to-image inside the client function to avoid SSR issues
      const { toPng } = await import('html-to-image');
      
      // Wait a moment for any assets to load and components to adjust
      await new Promise((resolve) => setTimeout(resolve, 150));

      const dataUrl = await toPng(cardRef.current, {
        quality: 1.0,
        pixelRatio: 2, // Retain sharp resolution on high-DPI screens
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
          width: cardRef.current.offsetWidth + 'px',
          height: cardRef.current.offsetHeight + 'px',
        }
      });

      const link = document.createElement('a');
      link.download = `waqfah-${activeTheme.id}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();

      toast({
        title: "تم تحميل البطاقة بنجاح!",
        description: "تم حفظ الصورة في التنزيلات.",
      });
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "فشل توليد البطاقة",
        description: "حدث خطأ غير متوقع أثناء تحويل البطاقة إلى صورة.",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="rounded-xl border border-white/5 bg-white/[0.02] hover:bg-primary/10 text-white/60 hover:text-primary gap-2 h-10 px-4">
            <Share2 className="w-4 h-4" />
            <span>مشاركة بطاقة دعوية</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-2xl bg-zinc-950/90 backdrop-blur-3xl border border-white/10 text-white rounded-[3rem] shadow-2xl p-8 overflow-hidden select-none">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />

        <DialogHeader className="relative z-10 text-right pb-4 border-b border-white/5">
          <DialogTitle className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
            <span>توليد <span className="text-primary italic">بطاقة دعوية</span></span>
          </DialogTitle>
          <DialogDescription className="text-white/40 font-medium">
            صمم بطاقتك الدعوية الفاخرة المقتبسة من المنصة وشاركها لتكسب الأجر.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 flex flex-col items-center gap-8 relative z-10">
          
          {/* --- THE SHARABLE CARD PREVIEW --- */}
          <div className="w-full flex justify-center">
            <div 
              ref={cardRef}
              className={cn(
                "w-[400px] min-h-[400px] rounded-[2.5rem] p-9 flex flex-col justify-between relative overflow-hidden border border-white/10 shadow-2xl text-right transition-all duration-500",
                activeTheme.class
              )}
              style={{
                backgroundImage: activeTheme.pattern,
                boxShadow: `0 30px 100px -20px ${activeTheme.glowColor}, inset 0 1px 2px rgba(255,255,255,0.15)`
              }}
            >
              {/* Islamic Pattern Header Decoration */}
              <div className="flex justify-between items-center opacity-85">
                <span 
                  className="px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border bg-white/5 border-white/10"
                  style={{ color: activeTheme.accentColor, borderColor: `${activeTheme.accentColor}30` }}
                >
                  {title}
                </span>
                
                {/* Visual Islamic Octagon Icon */}
                <div className="w-8 h-8 opacity-25" style={{ color: activeTheme.accentColor }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2L15 5H19V9L22 12L19 15V19H15L12 22L9 19H5V15L2 12L5 9V5H9L12 2Z" fill="currentColor" fillOpacity="0.1" />
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="my-auto py-6 space-y-6">
                {/* Quranic Arabic Styling for Content */}
                <p 
                  className={cn(
                    "text-white leading-relaxed text-right font-medium",
                    title.includes('قرآن') || title.includes('آية') ? "font-quran text-2xl md:text-3xl leading-[1.8]" : "font-headline font-bold text-xl"
                  )}
                >
                  {content}
                </p>

                {/* Optional Secondary Content (e.g. Answer or Translation) */}
                {secondaryContent && (
                  <div className="p-4 rounded-2xl bg-black/25 border border-white/5 backdrop-blur-sm">
                    <p className="text-white/70 text-sm leading-relaxed font-tajawal">
                      {secondaryContent}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer Area */}
              <div className="flex justify-between items-end border-t border-white/10 pt-6 mt-4">
                <div className="text-right">
                  {source && (
                    <p className="text-[11px] font-bold opacity-50 italic mb-1" style={{ color: activeTheme.accentColor }}>
                      {source}
                    </p>
                  )}
                  <p className="text-[9px] font-black opacity-30 tracking-widest uppercase">منصة وقفة الإيمانية</p>
                </div>

                {/* Logo & Decorative element */}
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: activeTheme.accentColor }} />
                  <span className="font-headline font-black text-sm tracking-tighter text-white">وقـــفــــة</span>
                </div>
              </div>
            </div>
          </div>

          {/* --- THEMES SELECTION PANEL --- */}
          <div className="w-full space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-white/40 mr-2 flex items-center gap-2">
              <Palette className="w-3.5 h-3.5" /> اختيار الثيم
            </span>
            <div className="flex flex-wrap gap-2.5 justify-center">
              {CARD_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setActiveTheme(theme)}
                  className={cn(
                    "px-4 py-2.5 rounded-xl border text-xs font-bold transition-all duration-300 flex items-center gap-2",
                    activeTheme.id === theme.id
                      ? "bg-white/10 border-white/20 text-white scale-105 shadow-md"
                      : "bg-white/[0.02] border-white/5 text-white/40 hover:text-white/70 hover:bg-white/[0.05]"
                  )}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.accentColor }} />
                  <span>{theme.name}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* --- ACTION BUTTONS --- */}
        <div className="flex justify-end gap-3 pt-6 border-t border-white/5 relative z-10">
          <DialogClose asChild>
            <Button variant="ghost" className="rounded-2xl h-14 px-8 font-black text-white/40 hover:bg-white/5">
              إغلاق
            </Button>
          </DialogClose>
          
          <Button 
            onClick={handleCopyText}
            variant="outline"
            className="rounded-2xl h-14 px-6 border-white/10 hover:bg-white/5 text-white font-bold gap-2"
          >
            {isCopied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
            <span>نسخ النص</span>
          </Button>

          <Button 
            onClick={handleDownloadImage}
            disabled={isDownloading}
            className="rounded-2xl h-14 px-8 bg-primary text-white hover:bg-primary/90 font-black text-lg gap-2 shadow-xl shadow-primary/20"
          >
            {isDownloading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            <span>تحميل البطاقة</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
