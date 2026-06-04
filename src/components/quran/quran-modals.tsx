'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Info, Quote, Sparkles, LayoutGrid, Maximize2, ImagePlus, Check, AlignRight,
  FileText, Loader2, Copy, Download, Trophy, Target, Clock, BookOpen, Star, ArrowLeft, Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CARD_THEMES, CARD_PATTERNS, CARD_FRAMES, SurahInfo } from './quran-constants';

export function ModalPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

export function PlanProgress({ percentage }: { percentage: number }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-40 h-40 flex items-center justify-center mx-auto">
      <svg className="w-full h-full -rotate-90">
        <circle cx="80" cy="80" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
        <motion.circle
          cx="80" cy="80" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="text-primary"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-white">{percentage}%</span>
        <span className="text-[8px] text-white/30 font-black uppercase tracking-[0.2em]">الإنجاز</span>
      </div>
    </div>
  );
}

export function SurahInfoModal({ surah, onClose }: { surah: SurahInfo; onClose: () => void }) {
  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[3rem] overflow-hidden shadow-3xl">
          <div className="p-8 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-xl font-black text-white flex items-center gap-3"><Info className="w-5 h-5 text-primary" /> تفاصيل السورة</h3>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors"><X className="w-5 h-5 text-white/40" /></button>
          </div>
          <div className="p-10 space-y-10">
            <div className="text-center">
              <h2 className="text-6xl font-black text-white mb-2">{surah.name}</h2>
              <p className="text-primary font-bold tracking-[0.3em] uppercase text-xs">{surah.englishName}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 text-center">
                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-2">مكان النزول</p>
                <p className="text-xl font-black text-white">{surah.revelationType === 'Meccan' ? 'مكية 🕋' : 'مدنية 🕌'}</p>
              </div>
              <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 text-center">
                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-2">عدد الآيات</p>
                <p className="text-xl font-black text-white">{surah.numberOfAyahs} آية</p>
              </div>
              <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 text-center">
                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-2">ترتيب النزول</p>
                <p className="text-xl font-black text-white">{surah.number}</p>
              </div>
              <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 text-center">
                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-2">تاريخ القراءة</p>
                <p className="text-xl font-black text-emerald-400">نشط الآن</p>
              </div>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-primary/10 border border-primary/20 text-center">
              <p className="text-white/60 text-sm leading-relaxed">
                تعتبر {surah.name} من السور العظيمة في القرآن الكريم، وتتميز بمواضيعها الإيمانية العميقة وتشريعاتها الحكيمة.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </ModalPortal>
  );
}

export function ShareModal({ verse, onClose }: { verse: any; onClose: () => void }) {
  const [activeTheme, setActiveTheme] = useState(CARD_THEMES[0]);
  const [isCustomTheme, setIsCustomTheme] = useState(false);
  const [customBg, setCustomBg] = useState('#134e4a'); // Default custom teal
  const [customText, setCustomText] = useState('#ccfbf1');
  const [userImage, setUserImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activePatterns, setActivePatterns] = useState([CARD_PATTERNS[1]]);
  const [activeFrames, setActiveFrames] = useState([CARD_FRAMES[0]]);
  const [aspectRatio, setAspectRatio] = useState<'square' | 'story'>('square');
  const [showTafseer, setShowTafseer] = useState(false);
  const [showLogo, setShowLogo] = useState(true);
  const [textGlow, setTextGlow] = useState(true);
  const [glassEffect, setGlassEffect] = useState(true);
  const [overlayOpacity, setOverlayOpacity] = useState(0.4);
  const [shadowDepth, setShadowDepth] = useState(40);
  const [signature, setSignature] = useState('');
  const [cardFont, setCardFont] = useState(verse.fontClass);
  const [customFontSize, setCustomFontSize] = useState(verse.arabic?.length > 150 ? 18 : 32);
  const [textAlign, setTextAlign] = useState<'center' | 'right' | 'justify'>('center');
  const [cardRadius, setCardRadius] = useState(40);
  const [filmGrain, setFilmGrain] = useState(false);
  const [gradientText, setGradientText] = useState(false);
  const [showMetadata, setShowMetadata] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const copyToClipboard = async () => {
    if (!cardRef.current) return;
    setIsCopying(true);
    try {
      const { toBlob } = await import('html-to-image');
      const blob = await toBlob(cardRef.current, { cacheBust: true, pixelRatio: 3 });
      if (blob) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        alert('تم نسخ الصورة بنجاح! يمكنك لصقها الآن في أي محادثة.');
      }
    } catch (err) {
      console.error(err);
      alert('تعذر النسخ، يرجى استخدام زر التحميل.');
    } finally {
      setIsCopying(false);
    }
  };

  const exportImage = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 3 });
      const link = document.createElement('a');
      link.download = `waqfah-ayah-${verse.ayahNumber}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserImage(reader.result as string);
        setIsCustomTheme(true);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[300] flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#0a0a0a]" />
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full h-full bg-[#0a0a0a] flex flex-col md:flex-row overflow-hidden"
        >
          {/* Preview Area - Left Side */}
          <div className="flex-1 bg-black/60 p-6 md:p-12 flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-l border-white/5 relative group min-h-0">
            <div className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full text-[8px] font-black tracking-widest text-white/20 uppercase z-50">
              معاينة التصميم <Sparkles className="w-3 h-3" />
            </div>

            {/* Responsive Card Container */}
            <div className="w-full h-full flex items-center justify-center overflow-auto custom-scrollbar p-4">
              <div
                ref={cardRef}
                className={cn(
                  "flex flex-col justify-between relative overflow-hidden transition-all duration-700 shadow-2xl shrink-0 h-auto",
                  !isCustomTheme && activeTheme.bg,
                  aspectRatio === 'square' ? "w-full max-w-[500px] min-h-[500px]" : "w-[350px] md:w-[400px] min-h-[620px] md:min-h-[711px]"
                )}
                style={{
                  borderRadius: `${cardRadius}px`,
                  backgroundColor: isCustomTheme ? customBg : undefined,
                  backgroundImage: (isCustomTheme && userImage) ? `url(${userImage})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {/* Pattern, Grain & Overlay Layer */}
                {activePatterns.map(pattern => (
                  <div
                    key={pattern.id}
                    className={cn("absolute inset-0 pointer-events-none transition-all duration-700", pattern.css)}
                    style={{ backgroundImage: pattern.url ? `url('${pattern.url}')` : 'none' }}
                  />
                ))}
                {filmGrain && (
                  <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
                )}
                <div className="absolute inset-0 bg-black pointer-events-none" style={{ opacity: overlayOpacity }} />

                {/* Frame Layers */}
                {activeFrames.map(frame => (
                  frame.id !== 'none' && <div key={frame.id} className={cn("absolute inset-0 pointer-events-none z-20 transition-all duration-500", frame.border)} />
                ))}

                {/* Content Container */}
                <div className="relative z-30 flex-1 flex flex-col justify-center gap-4 p-6 md:p-10">
                  <div className={cn(
                    "p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] transition-all duration-700 w-full flex-1 flex flex-col justify-center",
                    glassEffect ? "bg-white/[0.03] backdrop-blur-md border border-white/10 shadow-2xl" : ""
                  )}
                    style={{ boxShadow: glassEffect ? `0 ${shadowDepth}px ${shadowDepth * 2}px -${shadowDepth / 2}px rgba(0,0,0,0.5)` : 'none' }}>
                    <Quote className={cn("w-8 h-8 md:w-10 md:h-10 mx-auto mb-4 md:mb-6 opacity-10 shrink-0", !isCustomTheme && activeTheme.text)} style={{ color: isCustomTheme ? customText : undefined }} />
                    <div className="space-y-4 md:space-y-6" style={{ textAlign }}>
                      <p
                        dir="rtl"
                        style={{
                          fontSize: `${customFontSize}px`,
                          textShadow: textGlow ? `0 0 30px ${isCustomTheme || activeTheme.id === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.6)'}` : 'none',
                          color: (isCustomTheme && !gradientText) ? customText : undefined
                        }}
                        className={cn(
                          "leading-[1.6] md:leading-[2.2] transition-all",
                          gradientText ? (isCustomTheme ? "bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-500" : `bg-clip-text text-transparent bg-gradient-to-br ${activeTheme.textGradient}`) : (!isCustomTheme && activeTheme.text),
                          cardFont
                        )}
                      >
                        {verse.arabic}
                      </p>
                      {showTafseer && (
                        <p className={cn("text-[10px] md:text-sm opacity-60 leading-relaxed max-w-[90%] mx-auto font-medium", !isCustomTheme && activeTheme.text)} style={{ color: isCustomTheme ? customText : undefined }}>
                          {verse.tafseer}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Info */}
                {showMetadata && (
                  <div className="relative z-30 flex flex-col items-center pt-4 md:pt-6 mt-auto p-6 md:p-8 shrink-0">
                    <div className={cn("h-px w-12 mb-4 opacity-30", !isCustomTheme && activeTheme.accent)} style={{ backgroundColor: isCustomTheme ? customText : undefined }} />
                    <div className="text-center">
                      <span className={cn("text-[10px] md:text-sm font-black uppercase tracking-[0.2em] block mb-1", !isCustomTheme && activeTheme.text)} style={{ color: isCustomTheme ? customText : undefined }}>
                        سورة {verse.surah}
                      </span>
                      <span className={cn("text-[8px] md:text-xs font-bold opacity-60 uppercase tracking-widest", !isCustomTheme && activeTheme.text)} style={{ color: isCustomTheme ? customText : undefined }}>
                        الآية رقم {verse.ayahNumber}
                      </span>
                    </div>

                    {signature && (
                      <p className={cn("mt-4 text-[8px] md:text-[9px] font-black italic opacity-40", activeTheme.text)}>بواسطة: {signature}</p>
                    )}

                    {showLogo && (
                      <div className="mt-6 md:mt-8 flex items-center gap-2">
                        <div className={cn("px-3 py-1 rounded-full border text-[7px] md:text-[8px] font-black tracking-[0.3em] uppercase", activeTheme.text, "border-white/10 bg-white/5")}>
                          WAQFAH.COM
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Controls Area - Right Side */}
          <div className="w-full md:w-[380px] lg:w-[420px] flex flex-col bg-[#080808] border-l border-white/5 h-full shrink-0">
            <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#080808]/90 backdrop-blur-md z-50">
              <div className="flex flex-col">
                <h3 className="text-lg md:text-xl font-black text-white flex items-center gap-3">التصميم السينمائي</h3>
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">تعديل بطاقة المشاركة</span>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors"><X className="w-5 h-5 text-white/40" /></button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 space-y-10">
              {/* Groups... */}
              <div className="space-y-8">
                <section className="space-y-4">
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">١. التخطيط والأبعاد</p>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'square', label: 'Feed (مربع)', icon: LayoutGrid },
                        { id: 'story', label: 'Story (رأسي)', icon: Maximize2 }
                      ].map(opt => (
                        <button key={opt.id} onClick={() => setAspectRatio(opt.id as any)} className={cn("flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all", aspectRatio === opt.id ? "bg-primary/10 border-primary text-primary" : "bg-white/5 border-transparent text-white/40 hover:bg-white/10")}>
                          <opt.icon className="w-4 h-4" />
                          <span className="text-[9px] font-black">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center"><span className="text-[9px] font-black text-white/40 uppercase">استدارة الحواف</span><span className="text-[10px] font-black text-primary">{cardRadius}px</span></div>
                      <input type="range" min="0" max="60" value={cardRadius} onChange={(e) => setCardRadius(parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary" />
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">٢. الهوية البصرية</p>
                  <div className="grid grid-cols-6 gap-2">
                    {CARD_THEMES.map(theme => (
                      <button key={theme.id} onClick={() => { setIsCustomTheme(false); setActiveTheme(theme); }} className={cn("w-full aspect-square rounded-xl border-2 transition-all", theme.bg, !isCustomTheme && activeTheme.id === theme.id ? "border-primary scale-105 shadow-glow-primary" : "border-transparent opacity-40 hover:opacity-100")} />
                    ))}
                    <button onClick={() => setIsCustomTheme(true)} className={cn("w-full aspect-square rounded-xl border-2 transition-all flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900", isCustomTheme && !userImage ? "border-primary scale-105 shadow-glow-primary" : "border-transparent opacity-40 hover:opacity-100")}>
                      <span className="text-[10px] font-black">ألواني</span>
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className={cn("w-full aspect-square rounded-xl border-2 transition-all flex flex-col items-center justify-center bg-white/5", isCustomTheme && userImage ? "border-primary scale-105 shadow-glow-primary" : "border-transparent opacity-40 hover:opacity-100")}>
                      <ImagePlus className="w-4 h-4 mb-1" />
                      <span className="text-[8px] font-black uppercase">خلفيتي</span>
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                  </div>

                  {isCustomTheme && (
                    <div className="grid grid-cols-2 gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl animate-in fade-in slide-in-from-top-2">
                      <div className="space-y-2 flex flex-col items-center">
                        <label className="text-[9px] font-black text-white/50 uppercase">لون الخلفية</label>
                        <input type="color" value={customBg} onChange={(e) => setCustomBg(e.target.value)} className="w-full h-10 rounded cursor-pointer bg-transparent border-0" />
                      </div>
                      <div className="space-y-2 flex flex-col items-center">
                        <label className="text-[9px] font-black text-white/50 uppercase">لون النص</label>
                        <input type="color" value={customText} onChange={(e) => setCustomText(e.target.value)} className="w-full h-10 rounded cursor-pointer bg-transparent border-0" />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setGradientText(!gradientText)} className={cn("flex items-center justify-between p-3 rounded-xl border transition-all", gradientText ? "bg-primary/10 border-primary/20 text-primary" : "bg-white/5 border-transparent text-white/40 hover:bg-white/10")}>
                      <span className="text-[9px] font-black">نص مُذَهَّب</span>
                      {gradientText ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-white/20" />}
                    </button>
                    <button onClick={() => setFilmGrain(!filmGrain)} className={cn("flex items-center justify-between p-3 rounded-xl border transition-all", filmGrain ? "bg-primary/10 border-primary/20 text-primary" : "bg-white/5 border-transparent text-white/40 hover:bg-white/10")}>
                      <span className="text-[9px] font-black">تشويش (Grain)</span>
                      {filmGrain ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-white/20" />}
                    </button>
                  </div>
                </section>

                <section className="space-y-4">
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">٣. الزخارف والإطارات</p>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      {CARD_PATTERNS.map(p => {
                        const isActive = activePatterns.some(ap => ap.id === p.id);
                        return (
                          <button
                            key={p.id}
                            onClick={() => {
                              if (p.id === 'none') {
                                setActivePatterns([p]);
                              } else {
                                if (isActive) {
                                  const next = activePatterns.filter(ap => ap.id !== p.id);
                                  setActivePatterns(next.length ? next : [CARD_PATTERNS[0]]);
                                } else {
                                  setActivePatterns([...activePatterns.filter(ap => ap.id !== 'none'), p]);
                                }
                              }
                            }}
                            className={cn("py-2 px-1 rounded-xl text-[10px] font-black transition-all text-center", isActive ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.3)]" : "bg-white/5 text-white/40 hover:bg-white/10")}
                          >
                            {p.label}
                          </button>
                        );
                      })}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {CARD_FRAMES.map(f => {
                        const isActive = activeFrames.some(af => af.id === f.id);
                        return (
                          <button
                            key={f.id}
                            onClick={() => {
                              if (f.id === 'none') {
                                setActiveFrames([f]);
                              } else {
                                if (isActive) {
                                  const next = activeFrames.filter(af => af.id !== f.id);
                                  setActiveFrames(next.length ? next : [CARD_FRAMES[0]]);
                                } else {
                                  setActiveFrames([...activeFrames.filter(af => af.id !== 'none'), f]);
                                }
                              }
                            }}
                            className={cn("py-2 px-1 rounded-xl text-[10px] font-black transition-all text-center border", isActive ? "border-primary text-primary bg-primary/10 shadow-[0_0_15px_rgba(var(--primary),0.1)]" : "border-white/5 text-white/40 hover:bg-white/10")}
                          >
                            {f.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </section>

                <section className="space-y-6">
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">٤. إعدادات النص المتقدمة</p>
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center"><span className="text-[9px] font-black text-white/40 uppercase">حجم الخط</span><span className="text-[10px] font-black text-primary">{customFontSize}px</span></div>
                      <input type="range" min="10" max="64" value={customFontSize} onChange={(e) => setCustomFontSize(parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary" />
                    </div>

                    <div className="space-y-2">
                      <p className="text-[9px] font-black text-white/40 uppercase">محاذاة النص</p>
                      <div className="flex gap-2 p-1 bg-white/5 rounded-lg border border-white/5">
                        {[
                          { id: 'right', label: 'يمين', icon: AlignRight },
                          { id: 'center', label: 'توسيط', icon: LayoutGrid },
                          { id: 'justify', label: 'ضبط', icon: FileText }
                        ].map(a => (
                          <button key={a.id} onClick={() => setTextAlign(a.id as any)} className={cn("flex-1 py-2 flex justify-center items-center rounded-md transition-all", textAlign === a.id ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/80")}>
                            <a.icon className="w-3.5 h-3.5" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center"><span className="text-[9px] font-black text-white/40 uppercase">تعتيم الخلفية</span><span className="text-[10px] font-black text-primary">{Math.round(overlayOpacity * 100)}%</span></div>
                      <input type="range" min="0" max="0.9" step="0.1" value={overlayOpacity} onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center"><span className="text-[9px] font-black text-white/40 uppercase">عمق الظل</span><span className="text-[10px] font-black text-primary">{shadowDepth}px</span></div>
                      <input type="range" min="0" max="100" value={shadowDepth} onChange={(e) => setShadowDepth(parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary" />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => setTextGlow(!textGlow)} className={cn("flex flex-col items-center gap-2 p-3 rounded-xl transition-all", textGlow ? "bg-primary/10 text-primary" : "bg-white/5 text-white/40")}>
                        <Sparkles className="w-4 h-4" />
                        <span className="text-[8px] font-black uppercase">توهج النص</span>
                      </button>
                      <button onClick={() => setGlassEffect(!glassEffect)} className={cn("flex flex-col items-center gap-2 p-3 rounded-xl transition-all", glassEffect ? "bg-primary/10 text-primary" : "bg-white/5 text-white/40")}>
                        <Layers className="w-4 h-4" style={{ display: 'none' }} /* dummy to keep lucide import */ />
                        <span className="text-[8px] font-black uppercase">تأثير الزجاج</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">نوع الخط</p>
                      <div className="grid grid-cols-2 gap-2">
                        {['font-quran', 'font-amiri'].map(f => (
                          <button key={f} onClick={() => setCardFont(f)} className={cn("p-2 rounded-lg text-[9px] font-black transition-all border", cardFont === f ? "border-primary text-primary bg-primary/5" : "border-white/5 text-white/40")}>
                            {f === 'font-quran' ? 'عثماني' : 'كلاسيك'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">٥. التوقيع والمحتوى</p>
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="أدخل اسمك للتوقيع..."
                        value={signature}
                        onChange={(e) => setSignature(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 rounded-xl py-3.5 pl-10 pr-4 text-[10px] font-bold text-white placeholder:text-white/10 focus:outline-none focus:border-primary/40 transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'التفسير', state: showTafseer, setter: setShowTafseer },
                        { label: 'المعلومات', state: showMetadata, setter: setShowMetadata },
                        { label: 'الشعار', state: showLogo, setter: setShowLogo },
                      ].map((t, i) => (
                        <button key={i} onClick={() => t.setter(!t.state)} className={cn("flex items-center justify-between p-3 rounded-xl transition-all", t.state ? "bg-white/10 text-white" : "bg-white/5 text-white/20", i === 2 && "col-span-2")}>
                          <span className="text-[9px] font-black">{t.label}</span>
                          {t.state ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>
              </div>
            </div>

            <div className="p-6 md:p-8 border-t border-white/5 bg-black/80 sticky bottom-0 z-50 flex gap-2">
              <button disabled={isCopying} onClick={copyToClipboard} className="h-14 md:h-16 px-6 bg-white/10 text-white rounded-2xl md:rounded-[2rem] font-black flex items-center justify-center hover:bg-white/20 transition-all border border-white/10 shrink-0">
                {isCopying ? <Loader2 className="w-5 h-5 animate-spin" /> : <Copy className="w-5 h-5" />}
              </button>
              <button disabled={isExporting} onClick={exportImage} className="flex-1 h-14 md:h-16 bg-white text-black rounded-2xl md:rounded-[2rem] font-black flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-4xl">
                {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                {isExporting ? 'جاري التصدير...' : 'تصدير التصميم النهائي'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </ModalPortal>
  );
}

export function ExamModal({ memorizedVerses, onClose, onComplete }: { memorizedVerses: any[]; onClose: () => void; onComplete: (points: number) => void }) {
  const [currentExamVerse, setCurrentExamVerse] = useState<any>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    if (memorizedVerses.length > 0) {
      const random = memorizedVerses[Math.floor(Math.random() * memorizedVerses.length)];
      setCurrentExamVerse(random);
    }
  }, [memorizedVerses]);

  if (!currentExamVerse) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/95 backdrop-blur-xl" />
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[3.5rem] overflow-hidden shadow-4xl p-10 md:p-16 text-center">
          <div className="mb-12">
            <div className="w-20 h-20 bg-primary/20 rounded-[2rem] flex items-center justify-center mx-auto mb-6"><Trophy className="w-10 h-10 text-primary" /></div>
            <h3 className="text-3xl font-black text-white">اختبار تثبيت الحفظ</h3>
            <p className="text-white/40 text-sm mt-2">هل تتذكر الآية التالية؟</p>
          </div>

          <div className="space-y-10">
            <div className="p-10 rounded-[2.5rem] bg-white/[0.03] border border-white/5 relative">
              <div className="absolute -top-4 right-10 px-4 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-black text-primary uppercase tracking-widest">الآية السابقة</div>
              <p className="text-2xl md:text-3xl font-quran leading-relaxed text-white/60">"{currentExamVerse.arabic.split(' ').slice(0, -3).join(' ')}..."</p>
            </div>

            <AnimatePresence>
              {showAnswer ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-10 rounded-[2.5rem] bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <p className="text-3xl md:text-4xl font-quran leading-relaxed text-emerald-400 mb-6">{currentExamVerse.arabic}</p>
                  <div className="flex items-center justify-center gap-4">
                    <button onClick={() => { onComplete(10); onClose(); }} className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black text-sm hover:scale-105 transition-all">أجبت بشكل صحيح ✅</button>
                    <button onClick={onClose} className="px-8 py-4 bg-white/5 text-white/40 rounded-2xl font-black text-sm hover:bg-white/10 transition-all">أحتاج للمراجعة 🔄</button>
                  </div>
                </motion.div>
              ) : (
                <button onClick={() => setShowAnswer(true)} className="w-full h-24 rounded-[2.5rem] border-2 border-dashed border-white/10 text-white/20 font-black hover:border-primary/40 hover:text-primary transition-all text-xl">اضغط هنا لكشف الآية والتأكد</button>
              )}
            </AnimatePresence>
          </div>

          <button onClick={onClose} className="mt-12 text-white/20 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">إلغاء الاختبار</button>
        </motion.div>
      </div>
    </ModalPortal>
  );
}

export function WordAnalysisModal({ analysis, onClose }: { analysis: any; onClose: () => void }) {
  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
        <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} className="relative w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl p-8 text-center">
          <div className="absolute top-4 right-4"><button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors"><X className="w-4 h-4" /></button></div>

          <h3 className="text-xs font-black text-white/30 uppercase tracking-[0.2em] mb-8">التحليل اللغوي للكلمة</h3>

          {analysis.loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-4"><Loader2 className="w-8 h-8 text-primary animate-spin" /><p className="text-white/40 text-xs font-bold">جاري استخراج المعاني...</p></div>
          ) : analysis.error ? (
            <div className="py-12"><p className="text-red-400 text-sm font-bold">عذراً، تعذر جلب معلومات الكلمة. تأكد من اتصالك بالإنترنت.</p></div>
          ) : analysis.wordData ? (
            <div className="space-y-6">
              <div className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/5">
                <p className="text-5xl font-quran text-primary leading-normal mb-4 drop-shadow-[0_0_15px_rgba(var(--primary),0.3)]">{analysis.wordData.text_uthmani}</p>
                {analysis.wordData.transliteration?.text && <p className="text-white/40 text-[10px] font-mono tracking-widest uppercase">{analysis.wordData.transliteration.text}</p>}
              </div>

              <div className="space-y-6 text-right">
                <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                  <p className="text-[10px] text-primary/60 font-black uppercase tracking-widest mb-2 flex items-center gap-2"><FileText className="w-3 h-3" /> المعنى (عربي)</p>
                  <p className="text-lg font-bold text-white/90 leading-relaxed">{analysis.wordData.translation?.text || 'المعنى غير متوفر لهذه الكلمة'}</p>
                </div>
              </div>
            </div>
          ) : null}
        </motion.div>
      </div>
    </ModalPortal>
  );
}

export function CustomPlanModal({ onClose, customPagesInput, setCustomPagesInput, customDurationInput, setCustomDurationInput, customPlanType, setCustomPlanType, onSave }: any) {
  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[3rem] overflow-hidden shadow-3xl p-8" dir="rtl">
          <div className="flex items-center justify-between pb-6 border-b border-white/5">
            <h3 className="text-lg font-black text-white flex items-center gap-3"><Target className="w-5 h-5 text-primary" /> إنشاء خطة حفظ مخصصة</h3>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors"><X className="w-4.5 h-4.5 text-white/40" /></button>
          </div>

          <div className="py-6 space-y-6">
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
              <button onClick={() => setCustomPlanType('pages')} className={cn("flex-1 py-3 rounded-xl text-xs font-black transition-all", customPlanType === 'pages' ? "bg-primary text-primary-foreground" : "text-white/40 hover:text-white")}>حسب الورد اليومي (صفحات)</button>
              <button onClick={() => setCustomPlanType('duration')} className={cn("flex-1 py-3 rounded-xl text-xs font-black transition-all", customPlanType === 'duration' ? "bg-primary text-primary-foreground" : "text-white/40 hover:text-white")}>حسب مدة الختم (أشهر)</button>
            </div>

            {customPlanType === 'pages' ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/60">عدد الصفحات يومياً:</span>
                  <span className="text-sm font-black text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-xl">{customPagesInput} صفحات</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  value={customPagesInput}
                  onChange={(e) => setCustomPagesInput(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 mt-4">
                  <p className="text-[11px] font-tajawal text-white/50 leading-relaxed">
                    بمعدل حفظ <strong className="text-primary font-black">{customPagesInput} صفحات</strong> يومياً، ستختم القرآن الكريم كاملاً في غضون:
                  </p>
                  <div className="flex items-center gap-2 text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl w-fit">
                    <Clock className="w-3.5 h-3.5" />
                    <span>~ {Math.round(604 / (customPagesInput * 30)) || 1} أشهر تقريباً</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/60">المدة المطلوبة للختم:</span>
                  <span className="text-sm font-black text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-xl">{customDurationInput} أشهر</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="36"
                  step="1"
                  value={customDurationInput}
                  onChange={(e) => setCustomDurationInput(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 mt-4">
                  <p className="text-[11px] font-tajawal text-white/50 leading-relaxed">
                    لتتمكن من الختم في غضون <strong className="text-primary font-black">{customDurationInput} أشهر</strong>، سيتوجب عليك يومياً حفظ:
                  </p>
                  <div className="flex items-center gap-2 text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl w-fit">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>~ {Math.round((604 / (customDurationInput * 30)) * 10) / 10} صفحة يومياً</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-6 border-t border-white/5">
            <button onClick={onSave} className="flex-1 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-glow-primary">تفعيل الخطة المخصصة</button>
            <button onClick={onClose} className="px-6 py-4 bg-white/5 text-white/60 rounded-2xl font-black text-xs hover:bg-white/10 transition-all">إلغاء</button>
          </div>
        </motion.div>
      </div>
    </ModalPortal>
  );
}

export function TajweedGuideModal({ onClose }: any) {
  const rules = [
    {
      title: 'أحكام النون الساكنة والتنوين', items: [
        { name: 'الإظهار', desc: 'إخراج الحرف من مخرجه دون غنة. حروفه: (ء، هـ، ع، ح، غ، خ)', color: 'bg-blue-500/10 border-blue-500/20 text-blue-300' },
        { name: 'الإدغام', desc: 'دمج النون في الحرف التالي بغنة أو بدونها. حروفه: (ي، ر، م، ل، و، ن)', color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' },
        { name: 'الإقلاب', desc: 'قلب النون الساكنة أو التنوين ميماً مخفاة بغنة عند حرف (الباء)', color: 'bg-amber-500/10 border-amber-500/20 text-amber-300' },
        { name: 'الإخفاء', desc: 'نطق الحرف بحالة بين الإظهار والإدغام مع الغنة. بقية الحروف الـ 15', color: 'bg-violet-500/10 border-violet-500/20 text-violet-300' }
      ]
    },
    {
      title: 'المدود الأساسية', items: [
        { name: 'المد الطبيعي', desc: 'مد بمقدار حركتين عند انعدام الهمز أو السكون بعد حرف المد', color: 'bg-rose-500/10 border-rose-500/20 text-rose-300' },
        { name: 'المد المتصل', desc: 'أن يقع الهمز بعد حرف المد في كلمة واحدة، ويمد 4 أو 5 حركات واجبة', color: 'bg-purple-500/10 border-purple-500/20 text-purple-300' },
        { name: 'المد المنفصل', desc: 'أن يقع حرف المد في كلمة والهمز في الكلمة التالية، ويمد 4 أو 5 حركات جائزة', color: 'bg-orange-500/10 border-orange-500/20 text-orange-300' }
      ]
    }
  ];

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/95 backdrop-blur-md" />
        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[3rem] overflow-hidden shadow-4xl max-h-[85vh] flex flex-col" dir="rtl">
          <div className="p-8 border-b border-white/5 flex items-center justify-between shrink-0">
            <h3 className="text-xl font-black text-white flex items-center gap-3"><Star className="w-5 h-5 text-primary" /> دليل أحكام التجويد المبسط</h3>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors"><X className="w-5 h-5 text-white/40" /></button>
          </div>

          <div className="p-8 overflow-y-auto space-y-8 flex-1 custom-scrollbar">
            {rules.map((section, idx) => (
              <div key={idx} className="space-y-4">
                <h4 className="text-xs font-black text-primary uppercase tracking-widest border-r-2 border-primary pr-3">{section.title}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className={cn(
                        "p-5 border rounded-2xl space-y-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:border-white/20 select-none",
                        item.color
                      )}
                    >
                      <h5 className="font-bold text-sm flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {item.name}
                      </h5>
                      <p className="text-white/70 text-[11px] leading-relaxed font-tajawal">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 border-t border-white/5 bg-black/50 flex justify-end shrink-0">
            <button onClick={onClose} className="px-8 py-3 bg-white text-black rounded-xl font-black text-xs hover:scale-105 transition-all">فهمت</button>
          </div>
        </motion.div>
      </div>
    </ModalPortal>
  );
}

export function TafseerChatModal({ verse, messages, isListLoading, connectionMode, onClose, onSendMessage, chatInput, setChatInput }: any) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-xl bg-[#0a0a0a] border border-white/10 rounded-[3rem] overflow-hidden shadow-4xl max-h-[85vh] flex flex-col" dir="rtl">

          {/* Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="text-right">
                <h3 className="text-sm font-black text-white">رفيق التفسير والتدبر الذكي 🤖</h3>
                <p className="text-[10px] text-white/40">سورة {verse.surah} • آية {verse.ayahNumber}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={cn(
                "px-2.5 py-1 rounded-full text-[9px] font-black border",
                connectionMode === 'online'
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/20"
              )}>
                {connectionMode === 'online' ? "متصل بالذكاء الاصطناعي 🟢" : "وضع التدبر المحلي 🟠"}
              </span>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                <X className="w-4.5 h-4.5 text-white/40" />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar bg-black/[0.15]">
            {messages.map((msg: any, idx: number) => {
              const isAssistant = msg.role === 'model' || msg.role === 'assistant';
              return (
                <div key={idx} className={cn("flex gap-3 max-w-[85%] animate-in fade-in slide-in-from-top-2 duration-300", isAssistant ? "mr-0 ml-auto" : "ml-0 mr-auto flex-row-reverse")}>
                  <div className={cn("w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs", isAssistant ? "bg-primary/20 text-primary" : "bg-white/10 text-white/80")}>
                    {isAssistant ? '🤖' : '👤'}
                  </div>
                  <div className={cn("p-4 rounded-3xl text-xs leading-relaxed", isAssistant ? "bg-white/[0.03] border border-white/5 text-white/80" : "bg-primary text-primary-foreground font-semibold")}>
                    <p className="whitespace-pre-line font-tajawal">{msg.content}</p>
                  </div>
                </div>
              );
            })}

            {isListLoading && (
              <div className="flex gap-3 max-w-[85%] mr-0 ml-auto items-center animate-pulse">
                <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center text-xs text-primary">🤖</div>
                <div className="p-4 rounded-3xl bg-white/[0.03] border border-white/5 text-white/40 text-[11px] font-tajawal">جاري التدبر والتأمل في الآية...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Recommendations */}
          {messages.length === 1 && (
            <div className="p-4 bg-black/40 border-t border-white/5 space-y-2 shrink-0">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-widest text-right mb-1">أسئلة مقترحة للتدبر:</p>
              <div className="flex flex-wrap gap-2 justify-start">
                <button onClick={() => onSendMessage('ما البلاغة والإعجاز اللغوي في هذه الآية الكريمة؟')} className="px-3.5 py-2 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-bold text-white/60 hover:text-white hover:bg-white/10 hover:border-white/10 transition-all">✨ بلاغة الآية وإعجازها</button>
                <button onClick={() => onSendMessage('ما هو سبب نزول هذه الآية الكريمة؟')} className="px-3.5 py-2 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-bold text-white/60 hover:text-white hover:bg-white/10 hover:border-white/10 transition-all">📜 سبب النزول</button>
                <button onClick={() => onSendMessage('ما هي الدروس والعبر المستفادة من هذه الآية للعمل بها في حياتي؟')} className="px-3.5 py-2 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-bold text-white/60 hover:text-white hover:bg-white/10 hover:border-white/10 transition-all">💡 الدروس والعبر</button>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-white/5 bg-black/50 shrink-0 flex gap-2 items-center">
            <input
              type="text"
              placeholder="اكتب سؤالك الخاص حول تفسير الآية أو بلاغتها..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSendMessage()}
              disabled={isListLoading}
              className="flex-1 bg-white/5 border border-white/5 rounded-2xl px-5 py-3.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-primary transition-all font-tajawal"
            />
            <button
              onClick={() => onSendMessage()}
              disabled={isListLoading || !chatInput.trim()}
              className="p-3.5 bg-primary text-primary-foreground rounded-2xl hover:scale-105 active:scale-95 disabled:opacity-20 disabled:scale-100 transition-all"
            >
              <ArrowLeft className="w-5 h-5 transform rotate-180" />
            </button>
          </div>

        </motion.div>
      </div>
    </ModalPortal>
  );
}

export function QuickJumpModal({ onClose, surahs, quickJumpSurah, setQuickJumpSurah, quickJumpAyah, setQuickJumpAyah, onSubmit }: any) {
  const selectedSurahInfo = surahs.find((s: any) => s.number === quickJumpSurah);
  const maxAyahs = selectedSurahInfo ? selectedSurahInfo.numberOfAyahs : 286;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[3rem] overflow-hidden shadow-4xl p-8" dir="rtl">
          <div className="flex items-center justify-between pb-6 border-b border-white/5 mb-6">
            <h3 className="text-lg font-black text-white flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-primary" /> الانتقال السريع لآية كريمة
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors"><X className="w-5 h-5 text-white/40" /></button>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block">اختر السورة:</label>
              <select
                value={quickJumpSurah}
                onChange={(e) => {
                  setQuickJumpSurah(Number(e.target.value));
                  setQuickJumpAyah('');
                }}
                className="w-full bg-[#0f0f0f] border border-white/10 rounded-2xl px-4 py-3.5 text-xs font-bold text-white outline-none focus:border-primary/40 transition-all cursor-pointer"
              >
                {surahs.map((s: any) => (
                  <option key={s.number} value={s.number} className="bg-[#0c0c0c] text-white">
                    {s.number}. {s.name} ({s.englishName})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block">رقم الآية:</label>
                {selectedSurahInfo && (
                  <span className="text-[10px] font-bold text-white/30">السورة بها {maxAyahs} آية</span>
                )}
              </div>
              <input
                type="number"
                min={1}
                max={maxAyahs}
                placeholder="اكتب رقم الآية... (مثال: 5)"
                value={quickJumpAyah}
                onChange={(e) => setQuickJumpAyah(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-primary transition-all text-right font-bold"
                required
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-white/5">
              <button
                type="submit"
                className="flex-1 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-glow-primary flex items-center justify-center gap-2"
              >
                <span>انتقل الآن ⚡</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-4 bg-white/5 text-white/60 rounded-2xl font-black text-xs hover:bg-white/10 transition-all"
              >
                إلغاء
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </ModalPortal>
  );
}
